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

// 找出學生某個動作最近一次的紀錄；pr 是當時的 PR（沒有就是 undefined）
export function lastRecord(student, exerciseName) {
  for (let i = student.history.length - 1; i >= 0; i--) {
    const session = student.history[i]
    const ex = session.exercises.find((e) => e.name === exerciseName)
    if (ex) return { date: session.date, sets: ex.sets, pr: ex.pr }
  }
  return null
}

// 每個動作最新的 PR，以及前一次的 PR（用來顯示進步多少）：[{ exercise, weight, date, previous }]
export function latestPrs(student) {
  const byExercise = new Map()
  for (const pr of student.prs ?? []) {
    byExercise.set(pr.exercise, { ...pr, previous: byExercise.get(pr.exercise) })
  }
  return [...byExercise.values()]
}

export function currentPr(student, exerciseName) {
  return latestPrs(student).find((pr) => pr.exercise === exerciseName) ?? null
}

// 重量是 PR 的幾 %
export function percentOf(weight, pr) {
  return Math.round((weight / pr) * 100)
}

export const roundTo = (value, step) => Math.round(value / step) * step

// 一組的 %：教練指定的 %（set.pct）換算後就是現在的重量時，顯示教練指定的數字；
// 不然顯示實際換算的 %（例如 PR 105 的 65% 會四捨五入成 67.5 kg，仍然顯示 65%）
export function setPercent(set, pr, step) {
  return set.pct && roundTo((pr * set.pct) / 100, step) === set.weight ? set.pct : percentOf(set.weight, pr)
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
