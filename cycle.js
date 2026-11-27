(() => {
  'use strict';

  const model = window.PawCycleData;
  const {choices, legacyChoices, daysBetween, shift, today, duration, cycleFor, phase} = model;
  const $ = name => document.getElementById('cycle-' + name);
  const make = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const format = (date, full = false) => {
    const [year, month, day] = date.split('-').map(Number);
    return (full ? year + '年' : '') + month + '月' + day + '日';
  };
  const rangeText = ({start, end}) => start === end ? format(start) : format(start) + ' – ' + format(end, start.slice(0, 4) !== end.slice(0, 4));
  const phaseLabels = {
    period: '实际经期', forecast: '预测经期', ovulation: '预计排卵期', 'ovulation-day': '预计排卵日'
  };

  let selected = today();
  let screen = 'main';
  let now, storage, summary, spottingDates;
  const spottingLabel = '淋漓 / 点滴出血';
  const choiceFields = Object.keys(choices);
  const multiChoiceFields = new Set(['symptoms', 'moods']);
  const entryFields = [...choiceFields, 'note'];
  const expanded = new Set();
  const fieldPanel = key => $(key === 'note' ? 'note-field' : key);
  const recordIcons = {
    flow: 'M8 2C6 5 3.5 7.5 3.5 10a4.5 4.5 0 0 0 9 0C12.5 7.5 10 5 8 2Z',
    sex: 'M8 13.5 3 8.5C-1 4.5 4.5.5 8 5c3.5-4.5 9-.5 5 3.5Z',
    symptoms: 'M1 8h3l2-4 3 8 2-4h4',
    moods: 'M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM5.5 6h.1m4.8 0h.1M5.5 9.5q2.5 3 5 0',
    bedtime: 'M7 2a6 6 0 1 0 7 8A6 6 0 0 1 7 2Z',
    note: 'M4 2.5h8v11H4zM6 6h4M6 9h4'
  };
  const recordLabels = ['经量', '性行为', '身体症状', '心情', '入睡时间', '备注'];
  const bedtimeRanges = ['21:00—23:00', '23:00—01:00', '01:00—03:00'];
  const sexLabels = ['保护性行为', '无保护性行为'];

  function choiceArt(key, index, legacy) {
    const torso = '<path fill="url(#paint)" d="M10 5q6 4 12 0c3 4 4 7 2 11-2 4-1 7 2 11q-10 5-20 0c3-4 4-7 2-11-2-4-1-7 2-11Z"/>';
    const face = '<ellipse fill="url(#paint)" cx="16" cy="16" rx="12" ry="11.5"/><ellipse fill="#fff" opacity=".48" cx="11" cy="9" rx="4" ry="1.8"/>';
    const cheeks = '<ellipse fill="#df907f" opacity=".36" cx="8.5" cy="18" rx="2.5" ry="1.6"/><ellipse fill="#df907f" opacity=".36" cx="23.5" cy="18" rx="2.5" ry="1.6"/>';
    const mark = '<path fill="#fff3fc" d="m17 16-4 6h3l-1 4 5-6h-3Z"/>';
    const symptomArt = [
      torso + mark,
      torso + '<path d="M16 8q-3 4 0 8t0 8" fill="none" stroke="#eee4fc" stroke-width="2" stroke-dasharray="2 2"/><circle cx="16" cy="23" r="3.5" fill="#946ab6"/>',
      face + '<path fill="#9674b6" d="M4 15a12 12 0 1 1 24 0c-5 0-9-2-12-6-2 4-7 6-12 6Z"/><path fill="#fff" d="m23 5-4 6h3l-1 4 5-6h-3Z"/>',
      torso + '<circle cx="12" cy="15" r="4" fill="#f3e9fc"/><circle cx="20" cy="15" r="4" fill="#f3e9fc"/>',
      torso + '<ellipse fill="#eee1fa" cx="16" cy="21" rx="6.5" ry="4.5"/><circle cx="16" cy="20" r="1" fill="#9875b5"/>',
      face + '<path d="M8 16q2 2 4 0m8 0q2 2 4 0" stroke="#77568f" stroke-width="1.5" fill="none"/><ellipse cx="16" cy="22" rx="3" ry="2" fill="#9e7dbc"/>',
      face + '<circle cx="10" cy="17" r="2.7" fill="#ab77bf"/><circle cx="21" cy="13" r="2" fill="#ab77bf"/><circle cx="22" cy="21" r="1.5" fill="#ab77bf"/>',
      '<path fill="url(#paint)" d="M16 3C12 9 6 15 6 21a10 9 0 0 0 20 0c0-6-6-12-10-18Z"/><ellipse cx="12" cy="21" rx="2.1" ry="4" fill="#fff" opacity=".58"/>'
    ];
    const expressions = [
      'M9 14l2-2 2 2m6 0 2-2 2 2M11 18q5 10 10 0Z',
      'M11 14v1m10-1v1M11 19q5 6 10 0',
      'M9 15q2 2 4 0m6 0q2 2 4 0M13 20q3 3 6 0',
      'M9 13l4 2m10-2-4 2M12 22q4-6 8 0',
      'M9 16q1-4 4-3m6 0q3-1 4 3M12 21l3-1 2 2 3-1',
      'M9 12l4 3m10-3-4 3M12 22q4-5 8 0',
      'M10 15v1m12-1v1M13 22q3-3 6 0',
      'M9 15q2 1 4-2m6 0q2 3 4 2M12 23q4-5 8 0'
    ];
    const heart = '<path fill="url(#paint)" d="M16 28C12 25 3 20 3 12a7 7 0 0 1 13-4 7 7 0 0 1 13 4c0 8-9 13-13 16Z"/><ellipse fill="#fff" opacity=".48" cx="9" cy="11" rx="2.8" ry="1.6" transform="rotate(-36 9 11)"/>';
    const palettes = {sex:['#ffe3ee','#dc86aa'], symptoms:['#eee2fa','#b294d2'], moods:['#fff6ce','#edbe69'],
      bedtime:['#ede1fa','#a581ce']};
    const [light, dark] = palettes[key];
    const id = 'cycle-art-' + key + '-' + index;
    const shield = '<path fill="#fff3f8" d="M20 12q3 0 6-2l4 2v5q0 5-5 7-5-2-5-7Z"/><path d="m22 16 2 2 3-4" fill="none" stroke="#ac547d" stroke-width="1.6" stroke-linecap="round"/>';
    let art = face;
    if (key === 'bedtime') {
      art = '<path fill="url(#paint)" d="M15 4a12 12 0 1 0 13 16A12 12 0 0 1 15 4Z"/>' +
        '<path fill="#ae8ed1" d="M23 3l1.4 3.6L28 8l-3.6 1.4L23 13l-1.4-3.6L18 8l3.6-1.4Z"/>';
      if (index >= 1) art += '<circle cx="29" cy="13" r="1.4" fill="#ad8ed0"/>';
      if (index === 2) art += '<circle cx="29" cy="4" r="1.2" fill="#ad8ed0"/>';
    } else if (!legacy && key === 'sex') art = heart + (index === 0 ? shield : '<circle cx="22" cy="19" r="5" fill="#fff1f7"/><circle cx="22" cy="19" r="2" fill="#d482a4"/>');
    else if (!legacy && key === 'symptoms') art = symptomArt[index];
    else if (!legacy && key === 'moods') {
      art = face + cheeks + '<path d="' + expressions[index] + '" fill="none" stroke="#855839" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
      if (index === 7) art += '<path fill="#8db6ca" d="M11 17q-4 5 0 6 4-1 0-6Z"/>';
    }
    return '<svg class="cycle-choice-art" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="' + id +
      '" x2=".8" y2="1"><stop stop-color="' + light + '"/><stop offset="1" stop-color="' + dark +
      '"/></linearGradient></defs>' + art.replaceAll('#paint', '#' + id) + '</svg>';
  }

  function dayIcons(fields) {
    const row = make('span', '', 'cycle-day-icons');
    row.setAttribute('aria-hidden', 'true');
    const ns = 'http://www.w3.org/2000/svg';
    const visibleFields = fields.slice(0, 3);
    if (fields.includes('bedtime') && !visibleFields.includes('bedtime')) visibleFields[2] = 'bedtime';
    for (const key of visibleFields) {
      const icon = document.createElementNS(ns, 'svg');
      icon.setAttribute('viewBox', '0 0 16 16');
      icon.dataset.kind = key;
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', recordIcons[key]);
      icon.append(path);
      row.append(icon);
    }
    if (fields.length > 3) row.append(make('b', '+' + (fields.length - 3)));
    return row;
  }

  function notify(id, message = '') {
    $(id).textContent = message;
    $(id).hidden = !message;
  }

  function changeDate(date, focusDay) {
    if (!model.validDate(date)) return;
    if (date !== selected) expanded.clear();
    selected = date;
    notify('save-status');
    render();
    if (focusDay) $('grid').querySelector('[aria-pressed=true]')?.focus({preventScroll:true});
  }

  function dayButton(date) {
    const state = phase(summary, date);
    const entry = date <= now ? storage?.data.entries[date] : null;
    const fields = entryFields.filter(key => entry?.[key]?.length);
    const isToday = date === now;
    const button = make('button', '', 'cycle-day');
    button.type = 'button';
    button.dataset.date = date;
    button.dataset.phase = state;
    if (entry?.spotting) button.dataset.spotting = 'true';
    button.setAttribute('aria-label', [format(date, true), isToday && '今天', phaseLabels[state],
      entry?.spotting && spottingLabel, ...fields.map(key => recordLabels[entryFields.indexOf(key)])].filter(Boolean).join('，'));
    button.setAttribute('aria-pressed', String(date === selected));
    if (isToday) button.setAttribute('aria-current', 'date');
    button.onclick = () => changeDate(date, true);
    button.append(make('span', String(Number(date.slice(8)))));
    if (fields.length) button.append(dayIcons(fields));
    return button;
  }

  function monthStart(date) {
    return date.slice(0, 7) + '-01';
  }

  function monthEnd(date) {
    const first = monthStart(date);
    return first === '9999-12-01' ? '9999-12-31' : shift(monthStart(shift(first, 32)), -1);
  }

  function pageDate(step) {
    const first = monthStart(selected);
    if (step < 0) return monthStart(shift(first, -1));
    return monthStart(shift(first, 32));
  }

  function renderCalendar() {
    const first = monthStart(selected);
    const startColumn = (new Date(first).getUTCDay() + 6) % 7;
    const count = duration(first, monthEnd(selected));
    const days = Array.from({length: startColumn}, () => make('span'));
    for (let i = 0; i < count; i++) {
      const date = shift(first, i);
      days.push(dayButton(date));
    }
    $('grid').replaceChildren(...days);
    $('range').textContent = Number(first.slice(0, 4)) + '年' + Number(first.slice(5, 7)) + '月';
  }

  function spottingRanges(start, end) {
    return spottingDates.filter(date => start <= date && date <= end).map(date => ({start: date, end: date, kind: 'spotting'}));
  }

  function spottingGradient(ranges, start, count) {
    return phaseGradient(ranges, start, count, {spotting: 'var(--cycle-lavender)'}, 'transparent');
  }

  function phaseGradient(ranges, start, count, colors, base) {
    const stops = [];
    let cursor = 0;
    for (const range of ranges) {
      const before = Math.max(cursor, daysBetween(start, range.start));
      const after = Math.min(count, daysBetween(start, range.end) + 1);
      if (before >= after) continue;
      if (before > cursor) stops.push(base + ' ' + cursor / count * 100 + '% ' + before / count * 100 + '%');
      stops.push(colors[range.kind] + ' ' + before / count * 100 + '% ' + after / count * 100 + '%');
      cursor = after;
    }
    if (cursor < count) stops.push(base + ' ' + cursor / count * 100 + '% 100%');
    if (stops.length === 1) return stops[0].split(' ')[0];
    return 'linear-gradient(to right, ' + stops.join(', ') + ')';
  }

  function renderDaily(cycle, status, detail) {
    $('day-title').textContent = format(selected, true) + (selected === now ? ' · 今天' : '');
    $('status').textContent = status;
    $('status-detail').textContent = detail;
    const canEdit = !!storage && selected <= now;
    $('daily-controls').hidden = !canEdit;
    if (!canEdit) return;
    const period = cycle?.period;
    const starts = period?.start === selected;
    const ends = period?.end === selected;
    $('start').checked = starts;
    $('start').disabled = !starts && phase(summary, selected) === 'period';
    $('start-hint').textContent = starts && period.end ? '关闭后会同时清除这次经期的结束标记' :
      $('start').disabled ? '本次开始于 ' + format(period.start) : '';
    $('end').checked = ends;
    $('end').disabled = !period;
    $('end-hint').textContent = period ? '所选日期为最后一个经期日' : '请先在开始日打开经期开始开关';
    const entry = storage.data.entries[selected] || {};
    $('spotting').checked = !!entry.spotting;
    for (const key of entryFields) {
      const value = entry[key];
      const open = !!value?.length || expanded.has(key);
      $(key + '-switch').checked = open;
      fieldPanel(key).hidden = !open;
      if (key === 'note') {
        if ($('note').value !== (value || '')) $('note').value = value || '';
        continue;
      }
      for (const button of $(key).querySelectorAll('button')) {
        const pressed = multiChoiceFields.has(key) ? !!value?.includes(button.value) : value === button.value;
        button.setAttribute('aria-pressed', String(pressed));
        if (button.dataset.legacy) button.hidden = !pressed;
      }
    }
  }

  function renderForecast() {
    const estimates = $('estimates');
    estimates.replaceChildren();
    const {forecast, current, enoughHistory} = summary;
    if (forecast) {
      const list = make('dl', '', 'cycle-estimates');
      list.append(make('dt', '下次经期'), make('dd', rangeText(forecast), 'cycle-pink'));
      if (current.ovulation) {
        list.append(make('dt', '预计排卵期'), make('dd', rangeText(current.ovulation), 'cycle-blue'));
        list.append(make('dt', '预计排卵日'), make('dd', format(current.ovulation.day), 'cycle-blue'));
      }
      estimates.append(list);
    }
    const hint = !storage ? '经期数据读取失败。' :
      !enoughHistory ? '记录至少 3 次开始和 2 次完整经期后显示预测。' :
      !current.period.end ? '补录本次经期的最后一天后更新预测。' :
      !forecast ? '现有记录暂时无法推算下次经期。' :
      (now > forecast.start ? '已过预计开始日，仍计入当前周期。' : '') + '日期仅为估计，请勿用于避孕。';
    $('forecast-hint').textContent = hint;
  }

  function historyStripe(start, length, scale, ranges, spots) {
    const stripe = make('div', '', 'cycle-stripe');
    const colors = {period: 'var(--cycle-rose)', ovulation: 'var(--cycle-blue-dot)', 'ovulation-day': 'var(--cycle-blue)'};
    stripe.style.width = length / scale * 100 + '%';
    stripe.style.background = phaseGradient(ranges, start, length, colors, 'var(--cycle-rail)');
    stripe.style.setProperty('--stripe-step', (100 / length) + '%');
    stripe.setAttribute('aria-hidden', 'true');
    if (spots.length) {
      const overlay = make('span', '', 'cycle-stripe-spotting');
      overlay.style.background = spottingGradient(spots, start, length);
      stripe.append(overlay);
    }
    return stripe;
  }

  function openHistoryDate(date) {
    screen = 'main';
    changeDate(date, true);
    window.scrollTo({top:0});
  }

  function renderHistory() {
    const list = $('history-list');
    const {cycles, averagePeriod, averageCycle} = summary;
    $('average-period').textContent = averagePeriod === null ? '—' : averagePeriod + ' 天';
    $('average-cycle').textContent = averageCycle === null ? '—' : averageCycle + ' 天';
    $('history-add').disabled = !storage;
    list.replaceChildren();
    if (!cycles.length && !spottingDates.length) {
      list.append(make('p', storage ? '补录一次经期后，这里会显示周期色带。' : '经期数据读取失败，请从完整备份恢复。', 'cycle-panel cycle-muted'));
      return;
    }
    const scale = cycles.reduce((longest, cycle) => Math.max(longest, duration(cycle.start, cycle.end)), 1);
    let lastYear;
    for (const cycle of cycles.slice().reverse()) {
      const length = duration(cycle.start, cycle.end);
      const year = cycle.start.slice(0, 4);
      if (year !== lastYear) list.append(make('h3', Number(year) + '年', 'cycle-year'));
      lastYear = year;
      const row = make('article', '', 'cycle-panel cycle-history-row');
      const open = make('button', '', 'cycle-history-choice');
      open.type = 'button';
      open.append(make('strong', (cycle.current ? '当前周期 · 第 ' : '周期 · ') + length + ' 天'),
        make('span', cycle.current ? '开始于 ' + format(cycle.start) : rangeText(cycle), 'cycle-muted'));
      open.onclick = () => openHistoryDate(cycle.start);
      const period = cycle.period;
      const ranges = [{start: period.start, end: period.end || period.start, kind: 'period'}];
      const ovulation = cycle.ovulation;
      if (ovulation && ovulation.start <= cycle.end) {
        ranges.push({start: ovulation.start, end: shift(ovulation.day, -1), kind: 'ovulation'},
          {start: ovulation.day, end: ovulation.day, kind: 'ovulation-day'},
          {start: shift(ovulation.day, 1), end: ovulation.end, kind: 'ovulation'});
      }
      const spots = spottingRanges(cycle.start, cycle.end);
      const periodText = period.end ? '实际经期 ' + rangeText(period) : '已记录开始，结束待补录';
      const ovulationText = ovulation && ovulation.end <= cycle.end ? ' · 推算排卵期 ' + rangeText(ovulation) : '';
      const spottingText = spots.length ? ' · ' + spottingLabel + ' ' + spots.length + ' 天' : '';
      row.append(open, historyStripe(cycle.start, length, scale, ranges, spots),
        make('p', periodText + ovulationText + spottingText, 'cycle-muted'));
      list.append(row);
    }
    const unassigned = new Map();
    for (const date of spottingDates) {
      if (cycles[0] && date >= cycles[0].start) break;
      const month = monthStart(date);
      if (!unassigned.has(month)) unassigned.set(month, []);
      unassigned.get(month).push(date);
    }
    if (unassigned.size) list.append(make('h3', '未归入周期的出血记录', 'cycle-year'));
    for (const [month, dates] of [...unassigned].reverse()) {
      const row = make('article', '', 'cycle-panel cycle-history-row');
      const dateButton = make('button', month.slice(0, 4) + '年' + Number(month.slice(5, 7)) + '月', 'cycle-history-choice');
      dateButton.type = 'button';
      dateButton.onclick = () => openHistoryDate(dates.at(-1));
      const length = duration(month, monthEnd(month));
      const spots = dates.map(date => ({start:date, end:date, kind:'spotting'}));
      row.append(dateButton, historyStripe(month, length, length, [], spots),
        make('p', spottingLabel + ' ' + dates.length + ' 天', 'cycle-muted'));
      list.append(row);
    }
  }

  function render() {
    const date = today();
    if (selected === now && date !== now && document.activeElement !== $('note')) {
      selected = date;
      expanded.clear();
    }
    now = date;
    const wasUnreadable = storage === null;
    try { storage = model.read(); } catch (_) { storage = null; }
    if (wasUnreadable && storage) notify('save-status');
    summary = model.summarize(storage?.data || model.empty(), now);
    spottingDates = Object.keys(storage?.data.entries || {}).filter(date => date <= now && storage.data.entries[date].spotting).sort();
    $('main').hidden = screen !== 'main';
    $('history').hidden = screen !== 'history';
    if (screen === 'history') {
      renderHistory();
      return;
    }
    $('prev').disabled = !model.validDate(pageDate(-1));
    $('next').disabled = !model.validDate(pageDate(1));
    const cycle = cycleFor(summary, selected);
    const state = phase(summary, selected);
    const elapsed = cycle && duration(cycle.start, selected);
    const overdue = cycle?.current && summary.forecast && selected > summary.forecast.start;
    let status = '尚无周期记录';
    let detail = selected > now ? '未来日期可查看预测' : '选择日期记录经期与当日感受';
    if (cycle) {
      status = selected > now ? '未开始新周期' : '周期第 ' + elapsed + ' 天';
      detail = cycle.current ? '开始于 ' + format(cycle.start) : '周期共 ' + duration(cycle.start, cycle.end) + ' 天';
      if (state === 'period') status = '经期第 ' + elapsed + ' 天';
      else if (state) status = phaseLabels[state];
      else if (!cycle.period.end && selected <= now) status = '经期结束待记录';
      if (state === 'forecast' && selected > now) detail = '等待确认实际开始日';
      else if (overdue && selected <= now) detail = '已过预计开始日 · 当前周期第 ' + elapsed + ' 天';
    }
    if (selected <= now && storage?.data.entries[selected]?.spotting) {
      if (state) detail += ' · ' + spottingLabel;
      else status = spottingLabel;
    }
    renderCalendar();
    renderDaily(cycle, status, detail);
    renderForecast();
    if (!storage) notify('save-status', '经期数据读取失败，请从完整备份恢复。');
  }

  function show(next) {
    screen = next;
    notify('save-status');
    render();
    window.scrollTo({top: 0});
  }

  function persist(data) {
    try {
      model.save(data, storage.raw);
      notify('save-status');
      render();
    } catch (error) {
      render();
      notify('save-status', '未保存。' + error.message);
    }
  }

  $('start').onchange = ({target}) => {
    const data = storage?.data;
    if (!data || selected > today()) return;
    const periods = data.periods.filter(period => period.start !== selected);
    if (target.checked) periods.push({start:selected, end:null});
    periods.sort((a, b) => a.start.localeCompare(b.start));
    persist({...data, periods});
  };
  $('end').onchange = ({target}) => {
    const data = storage?.data;
    if (!data || selected > today()) return;
    const period = data.periods.findLast(item => item.start <= selected);
    if (!period) return;
    const periods = data.periods.map(item => item === period ? {...item, end:target.checked ? selected : null} : item);
    persist({...data, periods});
  };

  function updateEntry(key, value) {
    const data = storage?.data;
    if (!data || selected > today()) return;
    const entries = {...data.entries};
    const entry = {...entries[selected]};
    if (value) entry[key] = value;
    else delete entry[key];
    if (Object.keys(entry).length) entries[selected] = entry;
    else delete entries[selected];
    persist({...data, entries});
  }

  $('spotting').onchange = ({target}) => updateEntry('spotting', target.checked);
  for (const key of entryFields) {
    $(key + '-switch').onchange = ({target}) => {
      if (target.checked) {
        expanded.add(key);
        render();
      } else {
        expanded.delete(key);
        updateEntry(key, null);
      }
    };
  }
  // Wait for committed IME text so rendering never interrupts an active composition.
  $('note').oninput = event => {
    if (!event.isComposing) updateEntry('note', event.target.value);
  };
  $('note').oncompositionend = event => updateEntry('note', event.target.value);
  for (const key of choiceFields) {
    const values = [...choices[key], ...(legacyChoices[key] || [])];
    for (const [index, value] of values.entries()) {
      const button = make('button', '', 'cycle-option');
      button.type = 'button';
      button.value = value;
      button.setAttribute('aria-pressed', 'false');
      if (index >= choices[key].length) {
        button.dataset.legacy = 'true';
        button.hidden = true;
        button.setAttribute('aria-label', value + '（旧记录）');
      }
      if (key === 'flow') {
        const drops = make('span', '', 'cycle-flow-drops');
        drops.setAttribute('aria-hidden', 'true');
        for (let i = 0; i <= index; i++) drops.append(make('i'));
        button.append(drops);
      }
      const legacy = index >= choices[key].length;
      if (key !== 'flow') button.innerHTML = choiceArt(key, index, legacy);
      button.append(make('span', key === 'sex' && !legacy ? sexLabels[index] : value));
      if (key === 'bedtime') button.append(make('small', bedtimeRanges[index]));
      button.onclick = () => {
        expanded.add(key);
        const current = storage?.data.entries[selected]?.[key];
        if (multiChoiceFields.has(key)) {
          const values = new Set(current || []);
          if (values.has(value)) values.delete(value);
          else values.add(value);
          updateEntry(key, values.size ? [...values] : null);
        } else {
          updateEntry(key, current === value ? null : value);
        }
        if (button.hidden) $(key + '-switch').focus();
      };
      $(key).append(button);
    }
  }

  $('history-open').onclick = () => { show('history'); $('history-back').focus(); };
  $('history-back').onclick = () => { show('main'); $('history-open').focus(); };
  $('history-add').onclick = () => openHistoryDate(selected <= now ? selected : now);
  $('today').onclick = () => changeDate(today());
  $('prev').onclick = () => changeDate(pageDate(-1));
  $('next').onclick = () => changeDate(pageDate(1));
  const visible = () => !document.getElementById('cycle').hidden;
  window.addEventListener('storage', event => {
    if ((event.key === model.KEY || event.key === null) && visible()) render();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visible() && now !== today()) render();
  });
  setInterval(() => { if (visible() && now !== today()) render(); }, 30000);
  window.PawCycle = {render};
})();
