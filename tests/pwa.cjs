// Run: node tests/pwa.cjs (Playwright + installed Microsoft Edge required).
const {chromium} = require('playwright');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const KEY = 'daily-tarot-journal-v1';
let revision = '', failScript = false, workerRevision = '';
const hits = [];
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  hits.push(url.pathname);
  if (url.pathname === '/seed') { res.end('seed'); return; }
  const relative = decodeURIComponent(url.pathname.replace(/^\/paw\//, '')) || 'index.html';
  try {
    if (failScript && relative === 'tarot_data.js') throw Error('simulated deploy failure');
    let body = await fs.readFile(path.join(root, relative));
    if (relative === 'index.html') body = Buffer.from(body.toString().replace('</title>', revision + '</title>'));
    if (relative === 'sw.js') body = Buffer.from(body.toString() + workerRevision);
    const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png'};
    res.setHeader('Content-Type', mime[path.extname(relative)] || 'text/plain');
    res.end(body);
  } catch (_) { res.writeHead(404); res.end('missing'); }
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({channel:'msedge', headless:true});
  try {
    const context = await browser.newContext({viewport:{width:390,height:844}});
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const legacy = {days:{'2026-09-01':{note:'旧记录',card:{index:0,reversed:true}}},
      plans:[{id:'p-old',name:'旧打卡',freq:'daily',house:6}],checklog:{'2026-09-01':['p-old']},
      tasks:[{id:'partner',name:'伴侣关系',house:7,planIds:[]}],
      importantDates:[{id:'old-date',kind:'custom',name:'旧生日',system:'solar',date:'2026-10-01',repeat:true,enabled:true,actions:[],completed:{}}]};
    const raw = JSON.stringify(legacy);
    await page.goto(origin+'/seed');
    await page.evaluate(([key, value]) => localStorage.setItem(key,value), [KEY,raw]);
    await page.goto(origin+'/paw/');
    await page.waitForFunction(() => document.getElementById('offline-status').textContent.includes('离线已就绪'));
    assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),raw,'opening must not rewrite legacy data');
    assert.equal(await page.evaluate(key=>localStorage.getItem(key+':before-pwa'),KEY),raw);
    await page.reload();
    await page.waitForSelector('#plan-list .plan-row');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight <= innerHeight+2),true,'home remains one screen');
    await context.setOffline(true);
    await page.reload();
    await page.locator('#plan-list .plan-row').first().click();
    await page.locator('#draw').click();
    // The draw opens a dialog. Close it before navigating to the journal.
    await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
    await page.locator('#feel-note-open').click();
    await page.locator('.note-input').last().fill('断网保存的记录');
    await page.locator('#tab-calendar').click();
    await page.locator('#date-new').click();
    await page.locator('#date-kind').selectOption('custom');
    await page.locator('#date-name').fill('离线日程');
    await page.locator('#date-solar').fill('2026-12-01');
    await page.locator('#date-form button[type="submit"]').click();
    const saved = await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
    assert(saved.tasks.some(t=>t.id==='partner'));
    assert.equal(saved.days['2026-09-01'].notes[0].v,'旧记录');
    assert(saved.importantDates.some(d=>d.id==='old-date'));
    assert(saved.importantDates.some(d=>d.name==='离线日程'));
    assert(Object.values(saved.days).some(d=>d.notes?.some(n=>n.v==='断网保存的记录')));
    assert(Object.values(saved.days).some(d=>d.card));
    await page.reload();
    assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY),saved);
    assert(await page.locator('#small-card img').evaluate(img=>img.complete && img.naturalWidth>0));
    console.log('PASS legacy preservation, original backup, offline reload/draw/check-in/journal, complete deck');

    await context.setOffline(false);
    revision = ' TEST-NEW';
    const beforeImages = hits.filter(p=>p.endsWith('.webp')).length;
    await page.evaluate(()=>navigator.serviceWorker.controller.postMessage({type:'PAW_CHECK'}));
    await page.waitForFunction(()=>!document.getElementById('pwa-update').hidden);
    assert(!(await page.title()).includes('TEST-NEW'),'no forced refresh');
    await page.reload();
    assert((await page.title()).includes('TEST-NEW'));
    assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY),saved);
    assert(hits.filter(p=>p.endsWith('.webp')).length-beforeImages < 10,'small release must not fetch the entire deck');
    console.log('PASS release update, no forced reload, data preserved, deck cache reused');

    // A partial deployment must not replace a complete offline shell.
    revision = ' BROKEN'; failScript = true;
    await page.evaluate(async()=>{
      await new Promise(resolve=>{
        const listener=e=>{if(e.data.type==='PAW_OFFLINE'){navigator.serviceWorker.removeEventListener('message',listener);resolve();}};
        navigator.serviceWorker.addEventListener('message',listener);
        navigator.serviceWorker.controller.postMessage({type:'PAW_CHECK'});
      });
    });
    await page.reload(); assert((await page.title()).includes('TEST-NEW'));
    failScript = false;
    const other = await browser.newContext(); const second = await other.newPage();
    await second.goto(origin+'/paw/');
    assert.equal(await second.evaluate(key=>localStorage.getItem(key),KEY),null);
    await other.close();
    console.log('PASS partial update fallback and independent device/browser storage');

    // Export includes check-ins and dates; restore validates before writing.
    await page.locator('#tab-records').click();
    await page.locator('#paw-tools summary').click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#backup-all').click();
    const download = await downloadPromise;
    const backup = JSON.parse(await fs.readFile(await download.path(),'utf8'));
    assert.deepEqual(backup.data.checklog,saved.checklog);
    assert.deepEqual(backup.data.importantDates,saved.importantDates);
    const corrupt = '{broken-json';
    await page.evaluate(([key,value])=>localStorage.setItem(key,value),[KEY,corrupt]);
    await page.reload();
    assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),corrupt);
    assert(await page.locator('#paw-tools').isVisible());
    assert((await page.locator('#save-status').textContent()).includes('停止写入'));
    page.once('dialog',dialog=>dialog.accept());
    await page.locator('#restore-all').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
    await page.waitForFunction(key=>{try{return JSON.parse(localStorage.getItem(key)).days}catch{return false}},KEY);
    await page.waitForSelector('#plan-list .plan-row');
    assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).checklog,KEY),saved.checklog);
    console.log('PASS full backup/restore and corrupt data write protection');

    revision = ' TEST-FINAL'; workerRevision = '\n// Worker update test\n';
    await page.evaluate(async()=>{
      await (await caches.open('unrelated-project')).put('/sentinel',new Response('keep'));
      const registration = await navigator.serviceWorker.getRegistration();
      await registration.update();
      if (registration.installing) await new Promise(resolve=>registration.installing.addEventListener('statechange',function(){if(this.state==='activated')resolve();}));
    });
    await page.reload();
    assert((await page.title()).includes('TEST-FINAL'));
    assert(await page.evaluate(()=>caches.has('unrelated-project')));
    assert.deepEqual(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).checklog,KEY),saved.checklog);
    console.log('PASS Service Worker replacement preserves data and unrelated caches');

    const preFailure = await page.evaluate(key=>localStorage.getItem(key),KEY);
    await page.evaluate(key=>{
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function(k,v){if(k===key)throw new DOMException('Full','QuotaExceededError');return original.call(this,k,v);};
      const value = PawStorage.current(); value.extraTest='unsaved';
      if(PawStorage.save(value))throw Error('unexpected success');
    },KEY);
    assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),preFailure);
    assert((await page.locator('#save-status').textContent()).includes('未保存'));
    await page.reload();
    await page.evaluate(key=>{
      const incoming=JSON.parse(localStorage.getItem(key)); incoming.otherWindow='preserve';
      localStorage.setItem(key,JSON.stringify(incoming));
      if(PawStorage.save(PawStorage.current()))throw Error('stale write accepted');
    },KEY);
    assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).otherWindow,KEY),'preserve');
    console.log('PASS quota failure and stale-window overwrite protection');
    assert(errors.every(e=>/JSON|Unexpected token|Expected property/.test(e)),JSON.stringify(errors));
    await context.close();
  } finally { await browser.close(); server.close(); }
})().catch(error=>{console.error(error); process.exitCode=1; server.close();});
