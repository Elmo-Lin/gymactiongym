import { coach } from './coach'
import { pilatesCoach } from './pilates'

// 兩種課程類別：健身（石頭教練）與皮拉提斯（霏霏教練）。在不同教室上課，各有自己的課程方案、教練與課表，
// 同一個時段兩邊可以各有一組學員。需與後端 Plan.java 的 program 保持一致
export const programs = {
  fitness: {
    id: 'fitness',
    name: '健身',
    coach,
    classesPath: '/classes',
    // 方案介紹頁的網址開頭，例如 /classes/one-on-one
    planBase: '/classes',
    coachPath: '/coach',
    schedulePath: '/schedule',
  },
  pilates: {
    id: 'pilates',
    name: '皮拉提斯',
    coach: pilatesCoach,
    classesPath: '/pilates',
    planBase: '/pilates/classes',
    coachPath: '/pilates/coach',
    schedulePath: '/pilates/schedule',
  },
}

// 不認得的類別一律當成健身（原本只有健身，舊的網址與預約資料都沒有類別）
export const getProgram = (id) => programs[id] ?? programs.fitness

export const planPath = (plan) => `${getProgram(plan.program).planBase}/${plan.id}`
