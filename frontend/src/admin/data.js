// Demo 用假資料：全部存在記憶體，重新整理頁面就會回到初始狀態

export const EXERCISES = [
  '深蹲', '硬舉', '羅馬尼亞硬舉', '臀推', '弓箭步', '腿推',
  '臥推', '肩推', '划船', '滑輪下拉', '引體向上', '二頭彎舉',
]

export const PLANS = {
  下肢訓練: ['深蹲', '羅馬尼亞硬舉', '臀推', '弓箭步'],
  上肢訓練: ['臥推', '划船', '肩推', '滑輪下拉'],
  全身訓練: ['硬舉', '臥推', '划船', '弓箭步'],
}

// 每個動作的基準重量（kg），會再乘上學生的力量係數
const BASE_WEIGHT = {
  深蹲: 50, 硬舉: 60, 羅馬尼亞硬舉: 45, 臀推: 60, 弓箭步: 16, 腿推: 90,
  臥推: 35, 肩推: 20, 划船: 30, 滑輪下拉: 35, 引體向上: 0, 二頭彎舉: 8,
}

const BASE_REPS = {
  深蹲: 8, 硬舉: 5, 羅馬尼亞硬舉: 10, 臀推: 10, 弓箭步: 10, 腿推: 12,
  臥推: 8, 肩推: 10, 划船: 10, 滑輪下拉: 12, 引體向上: 6, 二頭彎舉: 12,
}

export function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return toISO(new Date(y, m - 1, d + n))
}

export const TODAY = toISO(new Date())

const roundTo = (value, step) => Math.round(value / step) * step

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const STUDENT_SEED = [
  { name: '王小明', gender: '男', age: 28, goal: '增肌', plans: ['下肢訓練', '上肢訓練'], strength: 1.3, total: 20, remaining: 8, phone: '0912-345-678', note: '左膝曾受傷，深蹲注意膝蓋內夾' },
  { name: '陳小美', gender: '女', age: 32, goal: '減脂', plans: ['上肢訓練', '下肢訓練'], strength: 0.6, total: 10, remaining: 2, phone: '0922-111-234', note: '下班後上課，體力較差時降低強度' },
  { name: '林先生', gender: '男', age: 45, goal: '提升體能', plans: ['全身訓練'], strength: 1.1, total: 24, remaining: 12, phone: '0933-876-543', note: '高血壓控制中，避免憋氣' },
  { name: '張雅婷', gender: '女', age: 26, goal: '臀腿線條', plans: ['下肢訓練', '全身訓練'], strength: 0.75, total: 10, remaining: 3, phone: '0955-222-890', note: '' },
  { name: '李志豪', gender: '男', age: 35, goal: '力量', plans: ['下肢訓練', '上肢訓練'], strength: 1.6, total: 10, remaining: 0, phone: '0978-654-321', note: '準備參加健力比賽' },
  { name: '黃怡君', gender: '女', age: 38, goal: '產後恢復', plans: ['全身訓練'], strength: 0.5, total: 20, remaining: 15, phone: '0910-777-456', note: '核心訓練優先，腹直肌分離 2 指' },
  { name: '吳建宏', gender: '男', age: 30, goal: '增肌', plans: ['上肢訓練', '下肢訓練'], strength: 1.2, total: 12, remaining: 6, phone: '0939-123-987', note: '' },
  { name: '劉佳穎', gender: '女', age: 29, goal: '姿勢矯正', plans: ['上肢訓練', '全身訓練'], strength: 0.55, total: 10, remaining: 1, phone: '0968-345-112', note: '圓肩、骨盆前傾' },
]

function buildHistory(student, index) {
  const rand = seeded(index * 97 + 13)
  const sessions = []
  const count = 10
  for (let i = 0; i < count; i++) {
    const daysAgo = (count - i) * 4 + Math.floor(rand() * 2)
    const plan = student.plans[i % student.plans.length]
    const progress = 1 + i * 0.035
    const exercises = PLANS[plan].map((name) => {
      const step = BASE_WEIGHT[name] < 20 ? 1 : 2.5
      const weight = roundTo(BASE_WEIGHT[name] * student.strength * progress, step)
      const reps = BASE_REPS[name]
      return {
        name,
        sets: [
          { weight, reps },
          { weight, reps },
          { weight, reps: rand() > 0.5 ? reps - 1 : reps },
        ],
      }
    })
    sessions.push({
      id: `${student.id}-h${i}`,
      date: addDays(TODAY, -daysAgo),
      plan,
      exercises,
      note: i === count - 1 ? '狀況不錯，下次可以加重' : '',
    })
  }
  return sessions
}

export const INITIAL_STUDENTS = STUDENT_SEED.map((s, i) => {
  const student = { ...s, id: `s${i + 1}` }
  student.history = buildHistory(student, i)
  return student
})

// 排課：今天固定三堂，其餘依星期分布在本週與下週，讓任何一天打開 Demo 都有完整的一週
const TODAY_SEED = [
  ['10:00', 's1', '下肢訓練'],
  ['14:00', 's2', '上肢訓練'],
  ['19:00', 's3', '全身訓練'],
]

// [距離本週一的天數, 時間, 學生, 課程]
const WEEK_SEED = [
  [0, '09:00', 's6', '全身訓練'],
  [0, '18:30', 's7', '上肢訓練'],
  [1, '07:30', 's4', '下肢訓練'],
  [1, '12:00', 's8', '上肢訓練'],
  [1, '20:00', 's5', '下肢訓練'],
  [2, '08:00', 's4', '全身訓練'],
  [2, '18:00', 's7', '下肢訓練'],
  [3, '10:00', 's6', '全身訓練'],
  [3, '19:30', 's2', '下肢訓練'],
  [4, '07:00', 's8', '全身訓練'],
  [4, '18:00', 's1', '上肢訓練'],
  [5, '09:30', 's4', '下肢訓練'],
  [5, '16:00', 's7', '上肢訓練'],
  [6, '11:00', 's3', '全身訓練'],
  [7, '18:00', 's1', '下肢訓練'],
  [8, '10:00', 's6', '全身訓練'],
  [9, '19:00', 's2', '上肢訓練'],
  [10, '08:00', 's4', '全身訓練'],
]

const weekday = new Date().getDay()
const MONDAY = addDays(TODAY, weekday === 0 ? -6 : 1 - weekday)

export const INITIAL_BOOKINGS = [
  ...TODAY_SEED.map(([time, studentId, plan]) => ({ date: TODAY, time, studentId, plan })),
  ...WEEK_SEED.map(([offset, time, studentId, plan]) => ({
    date: addDays(MONDAY, offset),
    time,
    studentId,
    plan,
  })).filter((b) => b.date !== TODAY),
].map((b, i) => ({ ...b, id: `b${i + 1}`, done: b.date < TODAY }))
