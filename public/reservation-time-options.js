// Operating dates and local time follow the restaurant's Karachi timezone.
(function (root) {
  const minutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
  const clock = value => `${String(Math.floor(value / 60) % 24).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  function nowParts(now = new Date()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(now).map(p => [p.type, p.value]));
    return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
  }
  function options(config, date, start = '', now = new Date()) {
    const open = minutes(config.open_time || '12:00');
    const closeRaw = minutes(config.close_time || '03:00');
    const close = closeRaw <= open ? closeRaw + 1440 : closeRaw;
    const lastRaw = minutes(config.last_start_time || '02:00');
    const last = closeRaw < open ? (lastRaw < open ? lastRaw + 1440 : lastRaw) : close - 1;
    const current = nowParts(now);
    const day = date ? Date.parse(`${date}T00:00:00Z`) : NaN;
    const currentMinute = Date.parse(`${current.date}T00:00:00Z`) / 60000 + minutes(current.time);
    const future = t => !date || day / 60000 + t > currentMinute;
    const starts = [], ends = [];
    let selected = start ? minutes(start) : NaN;
    if (selected < open) selected += 1440;
    for (let t = open; t <= close; t++) {
      if (!future(t)) continue;
      if (t < close && t <= last) starts.push(clock(t));
      if (t > selected) ends.push(clock(t));
    }
    return { starts, ends: starts.includes(start) ? ends : [] };
  }
  const api = { options, nowParts };
  if (typeof module !== 'undefined') module.exports = api;
  else root.ReservationTimeOptions = api;
})(globalThis);

