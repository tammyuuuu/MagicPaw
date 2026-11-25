/* User data is independent of every PWA cache and release number. Never rename KEY. */
(() => {
  'use strict';
  const KEY = 'daily-tarot-journal-v1';
  const PREVIOUS = KEY + ':previous';
  const ORIGINAL = KEY + ':before-pwa';
  const cycle = window.PawCycleData;
  let baseline, blocked = false;
  const status = message => {
    const node = document.getElementById('save-status');
    node.textContent = message; node.hidden = !message;
  };
  function validate(value) {
    const object = v => v && typeof v === 'object' && !Array.isArray(v);
    if (!object(value)) throw Error('备份格式无效');
    for (const key of ['days', 'checklog']) {
      if (key in value && !object(value[key])) throw Error(key + ' 数据格式异常');
    }
    for (const key of ['tasks', 'plans', 'reminders', 'importantDates']) {
      if (key in value && (!Array.isArray(value[key]) || value[key].some(v => !object(v) || typeof v.name !== 'string' || !v.name.trim()))) throw Error(key + ' 数据格式异常');
    }
    if (Object.values(value.days || {}).some(v => !object(v) || ('notes' in v && !Array.isArray(v.notes)))) throw Error('日运数据格式异常');
    if (Object.values(value.checklog || {}).some(v => !Array.isArray(v))) throw Error('打卡数据格式异常');
    return value;
  }
  const api = window.PawStorage = {
    load() {
      try {
        baseline = localStorage.getItem(KEY);
        if (baseline === null) return null;
        const value = validate(JSON.parse(baseline));
        // Preserve the exact legacy bytes before any in-memory normalization.
        if (localStorage.getItem(ORIGINAL) === null) localStorage.setItem(ORIGINAL, baseline);
        return value;
      } catch (error) {
        blocked = true;
        status('原数据读取失败，已停止写入以保护记录。请导出备份，或恢复上次保存。');
        document.getElementById('paw-tools').open = true;
        document.getElementById('paw-tools').classList.add('storage-recovery');
        document.getElementById('home').hidden = true;
        document.getElementById('account').hidden = false;
        throw error;
      }
    },
    save(value) {
      try {
        if (blocked) throw Error('写入已暂停，请先导出备份并重新打开');
        const current = localStorage.getItem(KEY);
        if (current !== baseline) throw Error('另一窗口已修改记录，请导出当前备份并重新打开，避免覆盖');
        const next = JSON.stringify(validate(value));
        if (next !== current) {
          // If a backup or primary write fails, leave the original primary untouched.
          if (current !== null) localStorage.setItem(PREVIOUS, current);
          localStorage.setItem(KEY, next);
          baseline = next;
        }
        status(''); return true;
      } catch (error) {
        blocked = true;
        status('未保存：' + error.message + '。请保持页面打开并导出完整备份。');
        return false;
      }
    },
    acceptExternal(event) {
      if (blocked || event.oldValue !== baseline) return false;
      try { validate(JSON.parse(event.newValue)); baseline = event.newValue; return true; }
      catch (_) { blocked = true; status('另一窗口的数据异常，已停止写入。请导出备份。'); return false; }
    },
    canReload: () => !blocked,
    current: null
  };
  function download(text, name) {
    const url = URL.createObjectURL(new Blob([text], {type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  document.getElementById('backup-all').onclick = () => {
    try {
      const raw = localStorage.getItem(KEY);
      let cycleData, cycleRaw;
      try { cycleData = cycle.read().data; }
      catch (_) {
        cycleRaw = localStorage.getItem(cycle.KEY);
        document.getElementById('backup-status').textContent = '经期数据异常，已将原始内容保留在备份中。';
      }
      download(JSON.stringify({format:'paw-full-backup', version:2, exportedAt:new Date().toISOString(),
        data:api.current ? api.current() : (raw ? JSON.parse(raw) : {}),
        cycle:cycleData, cycleRaw, savedRaw:raw}, null, 2), 'Paw-完整备份.json');
    } catch (_) {
      // Even malformed JSON must remain recoverable without replacing it.
      try {
        download(JSON.stringify({savedRaw:localStorage.getItem(KEY), cycleRaw:localStorage.getItem(cycle.KEY)}, null, 2), 'Paw-原始数据.json');
      }
      catch (_) { status('浏览器禁止读取存储，请恢复存储权限后再试。'); }
    }
  };
  function restore(data, cycleData) {
    validate(data);
    const withCycle = cycleData !== undefined;
    const scope = withCycle ? '日运、日程、打卡和经期记录' : '日运、日程和打卡记录';
    if (!confirm('恢复将替换当前设备的' + scope + '。请先导出完整备份。确定恢复？')) return;
    const previous = localStorage.getItem(KEY);
    const previousCycle = withCycle ? localStorage.getItem(cycle.KEY) : null;
    const nextCycle = withCycle ? JSON.stringify(cycleData) : null;
    const updateCycle = withCycle && nextCycle !== previousCycle;
    if (previous !== null) localStorage.setItem(PREVIOUS, previous);
    if (updateCycle) localStorage.setItem(cycle.KEY, nextCycle);
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (error) {
      if (updateCycle && localStorage.getItem(cycle.KEY) === nextCycle) {
        if (previousCycle === null) localStorage.removeItem(cycle.KEY);
        else localStorage.setItem(cycle.KEY, previousCycle);
      }
      throw error;
    }
    location.reload();
  }
  document.getElementById('restore-all').onchange = async event => {
    try {
      const file = event.target.files[0]; if (!file) return;
      const backup = JSON.parse(await file.text());
      if (backup.format !== 'paw-full-backup' || ![1, 2].includes(backup.version) || !backup.data?.days) throw Error('请选择 Paw 完整备份，日期范围导出不能恢复全部数据');
      restore(backup.data, backup.version === 2 ? cycle.validate(backup.cycle) : undefined);
    } catch (error) { document.getElementById('backup-status').textContent = '未恢复：' + error.message; }
    event.target.value = '';
  };
  document.getElementById('restore-previous').onclick = () => {
    try {
      const raw = localStorage.getItem(PREVIOUS) || localStorage.getItem(ORIGINAL);
      if (!raw) throw Error('尚无可恢复的历史备份');
      restore(JSON.parse(raw));
    } catch (error) { document.getElementById('backup-status').textContent = '未恢复：' + error.message; }
  };
  // Best effort; denial never prevents normal use. No data is sent to a server.
  document.addEventListener('click', () => {
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  }, {once:true});
})();
