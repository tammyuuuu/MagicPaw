// Run with Playwright and Microsoft Edge: node tests/cycle.cjs
const {chromium} = require('playwright');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const key = 'paw-menstrual-cycle-v1';
const journalKey = 'daily-tarot-journal-v1';
const types = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.webmanifest':'application/manifest+json', '.webp':'image/webp', '.png':'image/png'};
const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.join(root, pathname === '/' ? 'index.html' : pathname);
  try {
    const body = await fs.readFile(file);
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch (_) { res.writeHead(404).end(); }
});

(async () => {
  await new Promise((resolve, reject) => server.once('error', reject).listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({channel:'msedge', headless:true});
    const context = await browser.newContext({viewport:{width:320, height:750}, timezoneId:'Asia/Shanghai'});
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-11-25T04:00:00Z'));
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    await page.reload();
    const click = id => page.locator('#' + id).click();
    const text = id => page.locator('#' + id).textContent();
    const read = storageKey => page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);

    await click('home-history');
    assert(await page.locator('#journal-list').isVisible());
    await click('journal-back');
    await click('tab-cycle');
    assert.match(await text('cycle-forecast-hint'), /至少 3 次/);
    assert.equal(await page.locator('#cycle-grid [data-phase=forecast]').count(), 0);
    assert.equal(await page.locator('#cycle input[type=date], dialog[id^=cycle-]').count(), 0);

    const cell = date => page.locator('#cycle-grid [data-date="' + date + '"]');
    async function selectDate(date) {
      await click('cycle-calendar-toggle');
      const dateMonth = date.slice(0, 7);
      let shown = (await page.locator('#cycle-grid [aria-pressed=true]').getAttribute('data-date')).slice(0, 7);
      while (shown !== dateMonth) {
        await click(shown > dateMonth ? 'cycle-prev' : 'cycle-next');
        shown = (await page.locator('#cycle-grid [aria-pressed=true]').getAttribute('data-date')).slice(0, 7);
      }
      await cell(date).click();
    }
    async function add(start, end) {
      await selectDate(start);
      await click('cycle-start');
      assert.equal((await read(key)).periods.find(period => period.start === start).end, null);
      await selectDate(end);
      await click('cycle-end');
      assert.equal((await read(key)).periods.find(period => period.start === start).end, end);
    }

    await click('cycle-spotting');
    assert.equal(await cell('2026-11-25').getAttribute('data-spotting'), 'true');
    await click('cycle-ring-toggle');
    assert.match(await page.locator('#cycle-ring-days [aria-pressed=true]').getAttribute('aria-label'), /点滴出血/);
    await click('cycle-history-open');
    assert.equal(await text('cycle-average-period'), '—');
    assert.match(await text('cycle-history-list'), /未归入周期/);
    assert.equal(await page.locator('.cycle-stripe-spotting').count(), 1);
    await click('cycle-history-add');
    await click('cycle-spotting');
    assert.equal((await read(key)).entries['2026-11-25'], undefined);

    await add('2026-09-27', '2026-10-01');
    await add('2026-10-25', '2026-10-29');
    await click('cycle-history-open');
    assert.equal(await text('cycle-average-cycle'), '28 天');
    await click('cycle-history-back');
    assert.equal(await text('cycle-estimates'), '');

    await add('2026-08-30', '2026-09-03');
    assert.equal(await cell('2026-09-02').getAttribute('data-phase'), 'period');
    assert.equal(await cell('2026-09-03').getAttribute('data-phase'), 'period');
    assert.equal(await cell('2026-09-04').getAttribute('data-phase'), '');
    await click('cycle-end');
    assert.equal(await cell('2026-09-02').getAttribute('data-phase'), '');
    await selectDate('2026-09-04');
    await click('cycle-end');
    assert.equal((await read(key)).periods[0].end, '2026-09-04');
    assert.equal(await cell('2026-09-02').getAttribute('data-phase'), 'period');
    assert(await page.locator('#cycle-start').isDisabled());

    await selectDate('2026-10-27');
    await click('cycle-spotting');
    assert.equal(await cell('2026-10-27').getAttribute('data-phase'), 'period');
    assert.equal(await cell('2026-10-27').getAttribute('data-spotting'), 'true');
    await click('cycle-history-open');
    assert.equal(await text('cycle-average-period'), '5 天');
    assert.equal(await page.locator('.cycle-stripe').count(), 3);
    assert.match(await page.locator('.cycle-stripe').first().evaluate(node => getComputedStyle(node).backgroundImage), /linear-gradient/);
    assert.equal(await page.locator('.cycle-stripe-spotting').count(), 1);
    await click('cycle-history-back');
    await click('cycle-today');
    await click('cycle-spotting');
    assert.match(await text('cycle-status-detail'), /当前周期第 32 天/);
    assert.match(await text('cycle-estimates'), /11月22日 – 11月26日/);
    assert.equal(await page.locator('#cycle-grid [data-phase=forecast]').count(), 5);
    assert.equal(await page.locator('#cycle-grid [data-phase=ovulation-day]').count(), 1);
    assert.equal((await read(key)).periods.length, 3);
    assert.equal(await read(journalKey), null);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

    await click('cycle-ring-toggle');
    const day = page.locator('#cycle-ring-days [aria-pressed=true]');
    assert.match(await day.getAttribute('aria-label'), /11月25日.*预测经期/);
    assert.equal(await day.getAttribute('data-spotting'), 'true');
    assert.match(await page.locator('.cycle-wheel-spotting').evaluate(el => el.style.background), /conic-gradient/);
    await click('cycle-next');
    assert.match(await day.getAttribute('aria-label'), /11月26日/);
    await page.setViewportSize({width:1100, height:900});
    assert.equal(await page.locator('.cycle-layout').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), 1);
    assert.equal(await page.locator('main').evaluate(el => getComputedStyle(el).maxWidth), '600px');
    await click('cycle-today');
    await click('cycle-start');
    assert.equal((await read(key)).periods.at(-1).end, null);
    assert.equal(await text('cycle-estimates'), '');
    await click('cycle-end');
    assert.equal((await read(key)).periods.at(-1).end, '2026-11-25');
    await click('cycle-start');
    assert.equal((await read(key)).periods.length, 3);
    assert.equal((await read(key)).entries['2026-11-25'].spotting, true);
    await click('cycle-start');
    await click('cycle-end');
    assert.equal((await read(key)).periods.at(-1).end, '2026-11-25');
    await page.setViewportSize({width:320, height:750});

    const openField = id => page.locator('summary[aria-controls="cycle-' + id + '"]').click();
    const pill = (id, value) => page.locator('#cycle-' + id).getByRole('button', {name:value, exact:true});
    assert.equal(await page.locator('#cycle-daily-controls select').count(), 0);
    assert.equal(await page.locator('#cycle-daily-controls details[open]').count(), 0);
    await openField('flow');
    assert.deepEqual(await page.locator('#cycle-flow button').allTextContents(), ['少量', '中量', '大量']);
    assert.deepEqual(await page.locator('#cycle-flow button').evaluateAll(buttons =>
      buttons.map(button => button.querySelectorAll('.cycle-flow-drops i').length)), [1, 2, 3]);
    assert(await page.locator('#cycle-flow button').evaluateAll(buttons => {
      const widths = buttons.map(button => button.getBoundingClientRect().width);
      return Math.max(...widths) - Math.min(...widths) < 1;
    }));
    await pill('flow', '少量').click();
    await pill('flow', '中量').click();
    assert.equal(await pill('flow', '少量').getAttribute('aria-pressed'), 'false');
    assert.equal((await read(key)).entries['2026-11-25'].flow, '中量');
    await pill('flow', '中量').click();
    assert.equal((await read(key)).entries['2026-11-25'].flow, undefined);
    await pill('flow', '大量').click();
    assert.equal(await pill('flow', '大量').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(248, 220, 230)');
    await openField('flow');
    assert(await page.locator('#cycle-flow-value').isVisible());
    assert.equal(await text('cycle-flow-value'), '大量');
    await openField('sex');
    assert.deepEqual(await page.locator('#cycle-sex button:visible').allTextContents(), ['有保护措施', '无保护措施']);
    await pill('sex', '无保护措施').click();
    await pill('sex', '有保护措施').click();
    assert.equal(await pill('sex', '无保护措施').getAttribute('aria-pressed'), 'false');
    await openField('symptoms');
    assert.deepEqual(await page.locator('#cycle-symptoms button:visible').allTextContents(),
      ['腹痛', '腰痛', '头痛', '乳房胀痛', '腹胀', '疲劳', '恶心', '痘痘', '便秘', '腹泻', '食欲变化', '分泌物变化']);
    await pill('symptoms', '腹痛').click();
    await pill('symptoms', '分泌物变化').click();
    await pill('symptoms', '腹痛').click();
    assert.deepEqual((await read(key)).entries['2026-11-25'].symptoms, ['分泌物变化']);
    await openField('moods');
    assert.deepEqual(await page.locator('#cycle-moods button:visible').allTextContents(),
      ['开心', '平静', '低落', '焦虑', '烦躁', '敏感', '情绪波动']);
    await pill('moods', '平静').click();
    await pill('moods', '情绪波动').click();
    await openField('note');
    await page.locator('#cycle-note').fill('测试备注');
    assert.equal(await text('cycle-sex-value'), '有保护措施');
    assert.equal(await text('cycle-symptoms-value'), '分泌物变化');
    assert.equal(await text('cycle-moods-value'), '平静、情绪波动');
    await page.locator('#cycle-note').fill('修改后的测试备注');
    await selectDate('2026-11-24');
    assert.equal(await page.locator('#cycle-daily-controls details[open]').count(), 0);
    assert.equal(await text('cycle-flow-value'), '未记录');
    assert.equal((await read(key)).entries['2026-11-25'].note, '修改后的测试备注');
    const persisted = await read(key);
    await context.setOffline(true);
    await page.reload();
    await click('tab-cycle');
    assert.match(await text('cycle-note-value'), /修改后的测试备注/);
    assert.equal(await cell('2026-11-25').getAttribute('data-spotting'), 'true');
    assert.equal(await page.locator('.cycle-panel').first().evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(255, 255, 255)');

    await click('tab-account');
    const downloadPromise = page.waitForEvent('download');
    await click('backup-all');
    const backup = JSON.parse(await fs.readFile(await (await downloadPromise).path(), 'utf8'));
    assert.equal(backup.version, 2);
    assert.deepEqual(backup.cycle, persisted);
    async function importBackup(value) {
      page.once('dialog', dialog => dialog.accept());
      const loaded = page.waitForEvent('load');
      await page.locator('#restore-all').setInputFiles({name:'backup.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify(value))});
      await loaded;
    }
    await importBackup({format:'paw-full-backup', version:1, data:{days:{}}});
    assert.deepEqual(await read(key), persisted);
    await click('tab-account');
    await page.locator('#restore-all').setInputFiles({name:'invalid.json', mimeType:'application/json',
      buffer:Buffer.from(JSON.stringify({...backup, cycle:{periods:[{start:'2026-02-30', end:null}], entries:{}}}))});
    await page.waitForFunction(() => document.getElementById('backup-status').textContent.includes('未恢复'));
    assert.deepEqual(await read(key), persisted);

    await page.evaluate(key => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (name, value) {
        if (name === key) throw Error('测试写入失败');
        return original.call(this, name, value);
      };
    }, journalKey);
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#restore-all').setInputFiles({name:'replace.json', mimeType:'application/json',
      buffer:Buffer.from(JSON.stringify({...backup, cycle:{periods:[], entries:{}}}))});
    await page.waitForFunction(() => document.getElementById('backup-status').textContent.includes('测试写入失败'));
    assert.deepEqual(await read(key), persisted, 'journal restore failure rolls back the cycle change');
    await page.reload();

    await page.evaluate(key => localStorage.removeItem(key), key);
    await importBackup(backup);
    assert.deepEqual(await read(key), persisted);
    const legacyCycle = {...persisted, entries:{...persisted.entries,
      '2026-11-24':{flow:'点滴', note:'旧记录'},
      '2026-11-23':{flow:'中等', sex:'有（未注明保护情况）', symptoms:['腰酸', '疲倦']}}};
    await importBackup({...backup, cycle:legacyCycle});
    await click('tab-cycle');
    await selectDate('2026-11-24');
    assert.equal(await cell('2026-11-24').getAttribute('data-spotting'), 'true');
    assert.equal(await text('cycle-flow-value'), '未记录');
    assert.equal(await text('cycle-note-value'), '旧记录');
    assert.deepEqual((await read(key)).periods, persisted.periods);
    await selectDate('2026-11-23');
    assert.equal(await text('cycle-flow-value'), '中量');
    assert.equal(await text('cycle-symptoms-value'), '腰酸、疲劳');
    await openField('sex');
    assert.equal(await pill('sex', '有（未注明保护情况）（旧记录）').getAttribute('aria-pressed'), 'true');
    await pill('sex', '有（未注明保护情况）（旧记录）').click();
    assert.equal(await text('cycle-sex-value'), '未记录');
    assert.deepEqual(errors, []);
    console.log('PASS inline switches, spotting in three views, prediction, single-column layout, and offline backups');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
