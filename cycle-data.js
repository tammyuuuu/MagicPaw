(() => {
  'use strict';

  const KEY = 'paw-menstrual-cycle-v1';
  const DAY = 86400000;
  const choices = {
    flow: ['少量', '中量', '大量'],
    sex: ['有保护措施', '无保护措施'],
    symptoms: ['腹痛', '腰痛', '头痛', '乳房胀痛', '腹胀', '疲劳', '痘痘', '分泌物变化'],
    moods: ['兴奋', '开心', '放松', '敏感', '焦虑', '生气', '低落', '悲伤'],
    bedtime: ['亥时', '子时', '丑时']
  };
  const aliases = {
    flow: new Map([['中等', '中量'], ['较多', '大量']]),
    sex: new Map([['有（有保护）', '有保护措施'], ['有（无保护）', '无保护措施']]),
    symptoms: new Map([['疲倦', '疲劳']])
  };
  const legacyChoices = {
    sex: ['无', '有（未注明保护情况）'],
    symptoms: ['腰酸', '恶心', '便秘', '腹泻', '食欲变化'],
    moods: ['平静', '烦躁', '情绪波动']
  };
  const accepts = (key, value) =>
    choices[key].includes(value) || aliases[key]?.has(value) || legacyChoices[key]?.includes(value);
  const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / DAY);
  const shift = (date, days) => new Date(Date.parse(date) + days * DAY).toISOString().slice(0, 10);
  const today = () => {
    const date = new Date();
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
      .map((part, i) => String(part).padStart(i ? 2 : 4, '0')).join('-');
  };
  const validDate = date => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    date >= '0001-01-01' && Number.isFinite(Date.parse(date)) && shift(date, 0) === date;
  const empty = () => ({periods: [], entries: {}});
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const inRange = (date, range) => !!range && range.start <= date && date <= range.end;

  function validate(data) {
    if (!object(data) || !Array.isArray(data.periods) || !object(data.entries)) throw Error('经期数据格式异常');
    let previous;
    for (const period of data.periods) {
      if (!object(period) || !validDate(period.start) ||
        (period.end !== null && (!validDate(period.end) || period.end < period.start))) {
        throw Error('请填写有效的经期起止日期');
      }
      if (previous && (previous.start >= period.start || previous.end >= period.start)) {
        throw Error('经期日期重复或重叠');
      }
      previous = period;
    }
    for (const [date, entry] of Object.entries(data.entries)) {
      if (!validDate(date) || !object(entry) ||
        (entry.flow !== undefined && entry.flow !== '点滴' && !accepts('flow', entry.flow)) ||
        (entry.spotting !== undefined && typeof entry.spotting !== 'boolean') ||
        (entry.sex !== undefined && !accepts('sex', entry.sex)) ||
        (entry.symptoms !== undefined && (!Array.isArray(entry.symptoms) || entry.symptoms.some(value => !accepts('symptoms', value)))) ||
        (entry.moods !== undefined && (!Array.isArray(entry.moods) || entry.moods.some(value => !accepts('moods', value)))) ||
        (entry.bedtime !== undefined && !choices.bedtime.includes(entry.bedtime)) ||
        (entry.note !== undefined && (typeof entry.note !== 'string' || entry.note.length > 2000))) {
        throw Error('每日经期记录格式异常');
      }
    }
    return data;
  }

  function read() {
    const raw = localStorage.getItem(KEY);
    const data = raw === null ? empty() : validate(JSON.parse(raw));
    for (const entry of Object.values(data.entries)) {
      if (entry.flow === '点滴') {
        entry.spotting = true;
        delete entry.flow;
      }
      for (const key of ['flow', 'sex']) {
        if (aliases[key].has(entry[key])) entry[key] = aliases[key].get(entry[key]);
      }
      if (entry.symptoms) {
        entry.symptoms = [...new Set(entry.symptoms.map(value => aliases.symptoms.get(value) || value))];
      }
    }
    return {raw, data};
  }

  function save(data, expectedRaw) {
    validate(data);
    if (localStorage.getItem(KEY) !== expectedRaw) throw Error('经期数据已在另一窗口更新，请重试。');
    const raw = JSON.stringify(data);
    if (raw !== expectedRaw) localStorage.setItem(KEY, raw);
  }

  const duration = (start, end) => daysBetween(start, end) + 1;
  const mean = values => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;

  function ovulation(cycle, nextStart) {
    if (!cycle.end) return null;
    const day = shift(nextStart, -14);
    const start = shift(day, -5);
    return day > cycle.end
      ? {start: start > cycle.end ? start : shift(cycle.end, 1), end: shift(day, 1), day}
      : null;
  }

  function summarize(data, now) {
    const periods = data.periods.filter(period => period.start <= now)
      .map(period => period.end > now ? {...period, end: null} : period);
    const durations = periods.filter(period => period.end).map(period => duration(period.start, period.end));
    const intervals = periods.slice(1).map((period, i) => daysBetween(periods[i].start, period.start));
    const averagePeriod = mean(durations);
    const averageCycle = mean(intervals);
    const enoughHistory = durations.length >= 2 && intervals.length >= 2;
    const cycles = periods.map((period, i) => {
      const next = periods[i + 1];
      return {
        period, start: period.start, end: next ? shift(next.start, -1) : now, current: !next,
        ovulation: next && enoughHistory ? ovulation(period, next.start) : null
      };
    });
    const current = cycles.at(-1);
    let forecast = null;
    if (enoughHistory && current?.period.end) {
      const start = shift(current.start, averageCycle);
      if (validDate(start) && start > current.period.end) {
        forecast = {start, end: shift(start, averagePeriod - 1)};
        current.ovulation = ovulation(current.period, start);
      }
    }
    return {cycles, current, averagePeriod, averageCycle, forecast, enoughHistory};
  }

  function cycleFor(summary, date) {
    return summary.cycles.findLast(cycle => cycle.start <= date);
  }

  function phase(summary, date) {
    const cycle = cycleFor(summary, date);
    if (cycle && inRange(date, {start: cycle.start, end: cycle.period.end || cycle.start})) return 'period';
    if (inRange(date, summary.forecast)) return 'forecast';
    if (inRange(date, cycle?.ovulation)) return date === cycle.ovulation.day ? 'ovulation-day' : 'ovulation';
    return '';
  }

  window.PawCycleData = {KEY, choices, legacyChoices, daysBetween, shift, today, validDate, empty, validate, read, save,
    duration, summarize, cycleFor, phase};
})();
