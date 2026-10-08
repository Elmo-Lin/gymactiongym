export const WEEKDAY_LABELS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
export const WEEKDAY_SHORT = ['日', '一', '二', '三', '四', '五', '六']
// 週一開始的顯示順序
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

const pad = (n) => String(n).padStart(2, '0')

export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const parseISODate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const isValidISODate = (iso) => {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  return toISODate(parseISODate(iso)) === iso
}

export const todayISO = () => toISODate(new Date())

export const addDays = (iso, days) => {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export const weekdayOf = (iso) => parseISODate(iso).getDay()

// 取得該日期所在週的週一
export const startOfWeek = (iso) => {
  const day = weekdayOf(iso)
  return addDays(iso, day === 0 ? -6 : 1 - day)
}

export const formatDate = (iso) => {
  const d = parseISODate(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAY_SHORT[d.getDay()]}）`
}

export const formatDateLong = (iso) => {
  const d = parseISODate(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAY_LABELS[d.getDay()]}`
}

export const formatMonthDay = (iso) => {
  const d = parseISODate(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export const addMinutes = (time, minutes) => {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`
}

export const isValidTime = (time) => typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)

export const toDateTime = (iso, time) => {
  const d = parseISODate(iso)
  const [h, m] = time.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d
}
