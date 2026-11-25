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
  let view = 'calendar';
  let screen = 'main';
  let now, storage, summary, spottingDates;
  const spottingLabel = '淋漓 / 点滴出血';
  const choiceFields = Object.keys(choices);
  const multiChoiceFields = new Set(['symptoms', 'moods']);
  const entryFields = [...choiceFields, 'note'];

  function notify(id, message = '') {
    $(id).textContent = message;
    $(id).hidden = !message;
  }

  function changeDate(date, focusGroup) {
    if (!model.validDate(date)) return;
    if (date !== selected) {
      $('daily-controls').querySelectorAll('details[open]').forEach(detail => { detail.open = false; });
    }
    selected = date;
    notify('save-status');
    render();
    if (focusGroup) $(focusGroup).querySelector('[aria-pressed=true]')?.focus({preventScroll:true});
  }

  function dayButton(date, group) {
    const state = phase(summary, date);
    const entry = date <= now ? storage?.data.entries[date] : null;
    const hasDetails = entry && entryFields.some(key => entry[key]?.length);
    const isToday = date === now;
    const button = make('button', '', group === 'grid' ? 'cycle-day' : 'cycle-wheel-day');
    button.type = 'button';
    button.dataset.date = date;
    button.dataset.phase = state;
    if (entry?.spotting) button.dataset.spotting = 'true';
    if (group === 'grid' && hasDetails) button.dataset.entry = 'true';
    button.setAttribute('aria-label', [format(date, true), isToday && '今天', phaseLabels[state],
      entry?.spotting && spottingLabel, hasDetails && '有其他记录'].filter(Boolean).join('，'));
    button.setAttribute('aria-pressed', String(date === selected));
    if (isToday) button.setAttribute('aria-current', 'date');
    button.onclick = () => changeDate(date, group);
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
    if (view === 'ring') return shift(selected, step);
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
      const button = dayButton(date, 'grid');
      button.append(make('span', String(i + 1)));
      days.push(button);
    }
    $('grid').replaceChildren(...days);
    $('range').textContent = Number(first.slice(0, 4)) + '年' + Number(first.slice(5, 7)) + '月';
  }

  function renderRing(cycle, status, detail) {
    const wheel = $('ring-days');
    const track = $('ring').querySelector('.cycle-wheel-rail');
    const spottingTrack = $('ring').querySelector('.cycle-wheel-spotting');
    wheel.replaceChildren();
    $('ring-date').textContent = format(selected);
    $('ring-status').textContent = status;
    $('ring-caption').textContent = detail;
    // Extend the wheel through the one forecast, keeping all days on the actual current cycle.
    const forecast = cycle?.current && summary.forecast;
    const start = cycle?.start || monthStart(selected);
    const end = cycle ? (forecast && forecast.end > cycle.end ? forecast.end : cycle.end) : monthEnd(selected);
    const count = duration(start, end);
    $('range').textContent = rangeText({start, end});
    const marks = Math.min(count, 36);
    const visibleDays = new Set(Array.from({length: marks}, (_, i) =>
      marks === 1 ? 0 : Math.round(i * (count - 1) / (marks - 1))));
    const selectedIndex = daysBetween(start, selected);
    if (selectedIndex >= 0 && selectedIndex < count) {
      for (const index of visibleDays) {
        const distance = Math.abs(index - selectedIndex);
        if (distance > 0 && Math.min(distance, count - distance) < count / 48) visibleDays.delete(index);
      }
      visibleDays.add(selectedIndex);
    }
    for (const index of [...visibleDays].sort((a, b) => a - b)) {
      const date = shift(start, index);
      const button = dayButton(date, 'ring-days');
      const angle = (index + .5) / count * 2 * Math.PI;
      button.style.left = (50 + Math.sin(angle) * 40) + '%';
      button.style.top = (50 - Math.cos(angle) * 40) + '%';
      if (date === selected) button.append(make('span', String(Number(date.slice(8)))));
      wheel.append(button);
    }

    const colors = {period: 'var(--cycle-rose-bg)', ovulation: 'var(--cycle-blue-bg)', forecast: '#fff3f7'};
    const ranges = [];
    if (cycle) ranges.push({start, end: cycle.period.end || start, kind: 'period'});
    if (cycle?.ovulation) ranges.push({...cycle.ovulation, kind: 'ovulation'});
    if (forecast) ranges.push({...forecast, kind: 'forecast'});
    track.style.background = phaseGradient(ranges, start, count, colors, 'var(--cycle-rail)', 'conic-gradient');
    spottingTrack.style.background = spottingGradient(spottingRanges(start, end), start, count, 'conic-gradient');
    if (selected > end) $('ring-caption').textContent = '所选日期超出周期展示范围';
  }

  function spottingRanges(start, end) {
    return spottingDates.filter(date => start <= date && date <= end).map(date => ({start: date, end: date, kind: 'spotting'}));
  }

  function spottingGradient(ranges, start, count, layout) {
    return phaseGradient(ranges, start, count, {spotting: 'var(--cycle-lavender)'}, 'transparent', layout);
  }

  function phaseGradient(ranges, start, count, colors, base, layout) {
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
    return layout + '(' + (layout === 'linear-gradient' ? 'to right, ' : '') + stops.join(', ') + ')';
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
      const label = Array.isArray(value) ? value.join('、') : value;
      $(key + '-value').textContent = label || '未记录';
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
    stripe.style.background = phaseGradient(ranges, start, length, colors, 'var(--cycle-rail)', 'linear-gradient');
    stripe.style.setProperty('--stripe-step', (100 / length) + '%');
    stripe.setAttribute('aria-hidden', 'true');
    if (spots.length) {
      const overlay = make('span', '', 'cycle-stripe-spotting');
      overlay.style.background = spottingGradient(spots, start, length, 'linear-gradient');
      stripe.append(overlay);
    }
    return stripe;
  }

  function openHistoryDate(date) {
    view = 'calendar';
    screen = 'main';
    changeDate(date, 'grid');
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
      const top = make('div', '', 'cycle-history-top');
      const open = make('button', '', 'cycle-history-choice');
      open.type = 'button';
      open.append(make('strong', (cycle.current ? '当前周期 · 第 ' : '周期 · ') + length + ' 天'),
        make('span', cycle.current ? '开始于 ' + format(cycle.start) : rangeText(cycle), 'cycle-muted'));
      open.onclick = () => {
        view = 'ring';
        show('main');
        changeDate(cycle.current ? now : cycle.start);
        $('ring-toggle').focus();
      };
      const edit = make('button', '查看日历', 'cycle-link');
      edit.type = 'button';
      edit.onclick = () => openHistoryDate(cycle.start);
      top.append(open, edit);
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
      row.append(top, historyStripe(cycle.start, length, scale, ranges, spots),
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
    if (selected === now && !$('daily-controls').querySelector('details[open]')) selected = date;
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
    const ring = view === 'ring';
    $('calendar-toggle').setAttribute('aria-pressed', String(!ring));
    $('ring-toggle').setAttribute('aria-pressed', String(ring));
    $('calendar').hidden = ring;
    $('ring').hidden = !ring;
    $('prev').setAttribute('aria-label', ring ? '前一天' : '上个月');
    $('next').setAttribute('aria-label', ring ? '后一天' : '下个月');
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
    if (ring) renderRing(cycle, status, detail);
    else renderCalendar();
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
      button.append(make('span', value));
      button.onclick = () => {
        const current = storage?.data.entries[selected]?.[key];
        if (multiChoiceFields.has(key)) {
          const values = new Set(current || []);
          if (values.has(value)) values.delete(value);
          else values.add(value);
          updateEntry(key, values.size ? [...values] : null);
        } else {
          updateEntry(key, current === value ? null : value);
        }
        if (button.hidden) $(key).closest('details').querySelector('summary').focus();
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
  for (const kind of ['calendar', 'ring']) $(kind + '-toggle').onclick = () => {
    view = kind;
    render();
  };
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
