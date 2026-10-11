import { TODAY, addDays } from './data.js'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function weekday(iso) {
  return WEEKDAYS[parseISO(iso).getDay()]
}

export function shortDate(iso) {
  const d = parseISO(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function relativeDate(iso) {
  const diff = Math.round((parseISO(TODAY) - parseISO(iso)) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff === -1) return '明天'
  if (diff > 0) return `${diff} 天前`
  return shortDate(iso)
}

// 找出學生某個動作最近一次的紀錄
export function lastRecord(student, exerciseName) {
  for (let i = student.history.length - 1; i >= 0; i--) {
    const session = student.history[i]
    const ex = session.exercises.find((e) => e.name === exerciseName)
    if (ex) return { date: session.date, sets: ex.sets }
  }
  return null
}

// 一個動作的「最佳組」：重量最重，同重量取次數最多
export function topSet(sets) {
  return sets.reduce((best, s) =>
    s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps) ? s : best,
  )
}

export function formatWeight(w) {
  return Number.isInteger(w) ? String(w) : w.toFixed(1)
}

export function weekStart(iso) {
  const day = parseISO(iso).getDay()
  return addDays(iso, day === 0 ? -6 : 1 - day)
}
