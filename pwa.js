(() => {
  'use strict';
  const status = document.getElementById('offline-status');
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status.textContent = '离线安装需要 HTTPS（或 localhost）及支持 Service Worker 的浏览器。'; return;
  }
  let registration, checking = false, lastCheck = 0;
  const version = document.querySelector('meta[name="paw-release"]')?.content;
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'PAW_VERSION' && event.data.version && version !== event.data.version) {
      // Never force a refresh: event/date forms may contain unsaved input.
      document.getElementById('pwa-update').hidden = false;
    }
    if (event.data?.type === 'PAW_OFFLINE') {
      const {count, total} = event.data;
      status.textContent = count === total ? '离线已就绪：程序、完整牌组和图标已保存。' :
        `程序可离线使用；图片已保存 ${count}/${total}，联网打开后会继续补齐。未缓存的牌图不影响抽牌文字和记录。`;
    }
  });
  document.getElementById('pwa-reload').onclick = () => {
    if (window.PawStorage && !PawStorage.canReload()) {
      alert('当前有未保存或异常数据，请先导出完整备份。'); return;
    }
    if (confirm('已完成当前编辑并保存？现在更新 Paw。')) location.reload();
  };
  async function check() {
    if (!registration || checking || Date.now() - lastCheck < 30000) return;
    checking = true; lastCheck = Date.now();
    try { await registration.update(); } catch (_) {}
    (navigator.serviceWorker.controller || registration.active)?.postMessage({type:'PAW_CHECK'});
    checking = false;
  }
  window.addEventListener('load', async () => {
    try {
      registration = await navigator.serviceWorker.register('./sw.js', {scope:'./', updateViaCache:'none'});
      await navigator.serviceWorker.ready;
      await check();
    } catch (_) { status.textContent = '离线准备未完成，请联网后重新打开 Paw。已有本地记录不受影响。'; }
  });
  window.addEventListener('online', () => { lastCheck = 0; check(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
})();
