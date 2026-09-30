/* No build step: check the small application files on each online opening.
 * Immutable shell snapshots prevent mixing old HTML with new scripts.
 * This worker NEVER reads, writes or deletes personal storage.
 */
'use strict';
const ROOT = self.registration.scope;
const PREFIX = 'paw:' + new URL(ROOT).pathname + ':';
const META = PREFIX + 'meta';
const MEDIA = PREFIX + 'media';
const POINTER = new URL('__paw_current', ROOT).href;
const CORE = ['index.html', 'manifest.webmanifest', 'storage.js', 'pwa.js',
  'tarot_data.js', 'tarot_daily_content.js', 'tarot_minor_daily_content.js', 'tarot_spiritual_content.js'];
const IMAGES = ['assets/icon-192.png', 'assets/icon-512.png',
  ...Array.from({length:78}, (_, i) => '图片/维特塔罗/' + i + '.webp'), '图片/维特塔罗/back-mobile.webp'];
const urlOf = path => new URL(path, ROOT).href;
const mediaURLs = new Set(IMAGES.map(urlOf));
let refreshing, warming;
async function current() {
  const response = await (await caches.open(META)).match(POINTER);
  return response ? response.text() : null;
}
async function tell(message) {
  const clients = await self.clients.matchAll({type:'window', includeUncontrolled:true});
  clients.filter(client => client.url.startsWith(ROOT)).forEach(client => client.postMessage(message));
}
async function network(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {cache:'no-cache', signal:controller.signal});
    if (!response.ok || response.redirected) throw Error('Resource unavailable: ' + url);
    // A custom 404 page must never become a cached JavaScript/image file.
    const type = response.headers.get('content-type') || '';
    if (url.endsWith('.js') && !/javascript/.test(type)) throw Error('Invalid script response');
    if (/\.(webp|png)$/.test(url) && !type.startsWith('image/')) throw Error('Invalid image response');
    return response;
  } finally { clearTimeout(timer); }
}
async function refreshShell() {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const responses = await Promise.all(CORE.map(path => network(urlOf(path))));
    const digests = await Promise.all(responses.map(async response => {
      const bytes = await response.clone().arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
    }));
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(digests.join('-')));
    const version = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
    if (await current() !== version) {
      const cache = await caches.open(PREFIX + 'shell:' + version);
      await Promise.all(responses.map((response, i) => cache.put(urlOf(CORE[i]), response)));
      // Publish only after every resource is safely stored. Failed downloads keep the old shell.
      await (await caches.open(META)).put(POINTER, new Response(version));
      await tell({type:'PAW_VERSION', version});
      const old = (await caches.keys()).filter(key => key.startsWith(PREFIX + 'shell:') && key !== PREFIX + 'shell:' + version);
      await Promise.all(old.slice(0, Math.max(0, old.length - 2)).map(key => caches.delete(key)));
    }
    return version;
  })().finally(() => { refreshing = null; });
  return refreshing;
}
async function warmImages() {
  if (warming) return warming;
  warming = (async () => {
    const cache = await caches.open(MEDIA);
    let count = 0;
    // Only the actual deck and two install icons, never source PNGs or development files.
    for (let offset = 0; offset < IMAGES.length; offset += 4) {
      await Promise.all(IMAGES.slice(offset, offset + 4).map(async path => {
        const url = urlOf(path);
        if (await cache.match(url)) { count++; return; }
        try { await cache.put(url, await network(url)); count++; } catch (_) {}
      }));
    }
    await tell({type:'PAW_OFFLINE', count, total:IMAGES.length});
  })().finally(() => { warming = null; });
  return warming;
}
self.addEventListener('install', event => {
  event.waitUntil(refreshShell().then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('message', event => {
  if (event.data?.type !== 'PAW_CHECK') return;
  event.waitUntil((async () => {
    try { await refreshShell(); } catch (_) { /* Continue using the last complete release. */ }
    const version = await current();
    event.source?.postMessage({type:'PAW_VERSION', version});
    await warmImages();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!url.href.startsWith(ROOT)) return;
  const isHome = url.pathname === new URL(ROOT).pathname || url.pathname === new URL('index.html', ROOT).pathname;
  if (request.mode === 'navigate' && isHome) {
    event.respondWith((async () => {
      const version = await current() || await refreshShell();
      const cache = await caches.open(PREFIX + 'shell:' + version);
      const response = await cache.match(urlOf('index.html'));
      if (!response) return fetch(request);
      let html = await response.text();
      // Pin all scripts in this document to the same snapshot, even during an update.
      html = html.replace(/(<script\s+src=")([^"?]+)(")/g, (_, a, path, c) => a + path + '?__paw_release=' + version + c);
      html = html.replace('<head>', '<head><meta name="paw-release" content="' + version + '">');
      return new Response(html, {headers:{'Content-Type':'text/html; charset=utf-8'}});
    })());
    return;
  }
  const relative = decodeURIComponent(url.pathname.slice(new URL(ROOT).pathname.length));
  if (CORE.includes(relative)) {
    event.respondWith((async () => {
      const version = url.searchParams.get('__paw_release') || await current();
      const response = version && await (await caches.open(PREFIX + 'shell:' + version)).match(urlOf(relative));
      return response || fetch(request);
    })());
  } else if (mediaURLs.has(url.href)) {
    const cached = caches.open(MEDIA).then(cache => cache.match(url.href));
    const fresh = network(url.href).then(async response => {
      await (await caches.open(MEDIA)).put(url.href, response.clone()); return response;
    });
    event.waitUntil(fresh.catch(() => {}));
    event.respondWith(cached.then(response => response || fresh));
  }
});
