// Time helpers. "Minutes" always means minutes since local midnight in the searched city.

export function parseClock(s) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(s ?? '').trim());
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + Number(m[2]);
}

export function localMinutes(localtime) {
  const clock = String(localtime).split(' ')[1] ?? '0:00';
  const [h, m] = clock.split(':').map(Number);
  return h * 60 + m;
}

export function currentHourIndex(localtime) {
  return Math.floor(localMinutes(localtime) / 60);
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function weekdayShort(date) {
  const [y, mo, d] = date.split('-').map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
}

export function formatLocalTime(epochSec, tzId, opts = { hour: 'numeric', minute: '2-digit' }) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tzId, ...opts }).format(new Date(epochSec * 1000));
}
