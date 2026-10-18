// Demo 用假資料：全部存在記憶體，重新整理頁面就會回到初始狀態

export const EXERCISES = [
  '深蹲', '硬舉', '架上硬舉', '羅馬尼亞硬舉', '臀推', '弓箭步', '腿推',
  '臥推', '肩推', '划船', '滑輪下拉', '引體向上', '二頭彎舉',
]

export const PLANS = {
  下肢訓練: ['深蹲', '羅馬尼亞硬舉', '臀推', '弓箭步'],
  上肢訓練: ['臥推', '划船', '肩推', '滑輪下拉'],
  全身訓練: ['硬舉', '臥推', '划船', '弓箭步'],
}

// 皮拉提斯（霏霏教練）：器械、動作清單與課程主題。課程主題需與後端 CoachModels.PLAN 一致。
// 每個動作記錄器械、彈簧與每組次數，不記重量
export const APPARATUS = ['Reformer', 'Cadillac', 'Chair', '墊上']

export const PILATES_EXERCISES = [
  'Footwork', 'Hundred', 'Short Box', 'Long Stretch', 'Elephant', 'Rowing', 'Mermaid', 'Side Splits',
  'Roll Down', 'Push Through', 'Leg Springs', 'Pike', 'Single Leg Pump', 'Swan', 'Spine Stretch', 'Saw',
]

// 動作常用的器械，新增動作時預設帶入（教練可以再改）；清單外的動作預設 Reformer
const PILATES_APPARATUS = {
  'Roll Down': 'Cadillac', 'Push Through': 'Cadillac', 'Leg Springs': 'Cadillac',
  Pike: 'Chair', 'Single Leg Pump': 'Chair', Swan: 'Chair',
  'Spine Stretch': '墊上', Saw: '墊上',
}
export const apparatusFor = (name) => PILATES_APPARATUS[name] ?? 'Reformer'

export const PILATES_PLANS = {
  核心穩定: ['Footwork', 'Hundred', 'Short Box', 'Pike'],
  下肢雕塑: ['Footwork', 'Side Splits', 'Single Leg Pump', 'Leg Springs'],
  上肢體態: ['Rowing', 'Long Stretch', 'Push Through', 'Swan'],
  伸展放鬆: ['Roll Down', 'Mermaid', 'Spine Stretch', 'Saw'],
}

// 後台的兩種課程類別：學生、堂數、排課與訓練紀錄完全分開，最上方切換。需與後端 Plan.java 的 program 一致
export const PROGRAMS = {
  fitness: { id: 'fitness', label: '健身', plans: PLANS, exercises: EXERCISES },
  pilates: { id: 'pilates', label: '皮拉提斯', plans: PILATES_PLANS, exercises: PILATES_EXERCISES },
}

// 沒有 program 的舊學生都是健身
export const programOf = (student) => student.program ?? 'fitness'

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

// 測驗出來的 PR：[學生, 動作, 重量, 幾天前]
const PR_SEED = [
  ['s1', '深蹲', 100, 40],
  ['s1', '深蹲', 105, 6],
  ['s1', '臥推', 65, 6],
  ['s5', '深蹲', 140, 20],
  ['s5', '臥推', 95, 20],
  ['s5', '架上硬舉', 170, 20],
]

// 皮拉提斯的示範學生
const PILATES_SEED = [
  { name: '林小姐', gender: '女', age: 34, goal: '改善久坐痠痛', plans: ['核心穩定', '伸展放鬆'], total: 8, remaining: 5, phone: '0911-222-333', note: '下背容易緊，Roll Down 慢慢來' },
  { name: '周雅雯', gender: '女', age: 29, goal: '體態雕塑', plans: ['下肢雕塑', '上肢體態'], total: 16, remaining: 9, phone: '0952-888-101', note: '' },
  { name: '何太太', gender: '女', age: 41, goal: '產後恢復', plans: ['核心穩定', '下肢雕塑'], total: 8, remaining: 2, phone: '0937-456-789', note: '腹直肌分離，避免捲腹類動作' },
]

const SPRINGS = { Reformer: ['2紅1藍', '3紅', '1紅1藍', '1藍'], Cadillac: ['1紫', '2黃', '1藍'], Chair: ['1黑1灰', '2灰', '1黑'], 墊上: [''] }

function buildPilatesHistory(student, index) {
  const rand = seeded(index * 53 + 7)
  return Array.from({ length: 6 }, (_, i) => {
    const plan = student.plans[i % student.plans.length]
    const exercises = PILATES_PLANS[plan].map((name) => {
      const apparatus = apparatusFor(name)
      const springs = SPRINGS[apparatus]
      const reps = 8 + Math.floor(rand() * 3) * 2
      return { name, apparatus, spring: springs[Math.floor(rand() * springs.length)], sets: [{ weight: 0, reps }, { weight: 0, reps }] }
    })
    return {
      id: `${student.id}-h${i}`,
      date: addDays(TODAY, -(6 - i) * 5),
      plan,
      exercises,
      note: i === 5 ? '核心控制進步很多，下次 Footwork 可以減一條彈簧' : '',
    }
  })
}

export const INITIAL_STUDENTS = [
  ...STUDENT_SEED.map((s, i) => buildFitnessStudent(s, i)),
  ...PILATES_SEED.map((s, i) => {
    const student = { ...s, id: `p${i + 1}`, program: 'pilates', prs: [] }
    student.history = buildPilatesHistory(student, i)
    return student
  }),
]

function buildFitnessStudent(s, i) {
  const student = { ...s, id: `s${i + 1}`, program: 'fitness' }
  student.history = buildHistory(student, i)
  student.prs = PR_SEED.filter(([id]) => id === student.id).map(([, exercise, weight, daysAgo]) => ({
    exercise,
    weight,
    date: addDays(TODAY, -daysAgo),
  }))
  return student
}

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
  // 皮拉提斯在另一間教室，和健身同一個時間也沒關係
  [0, '10:00', 'p1', '核心穩定'],
  [1, '19:00', 'p2', '下肢雕塑'],
  [2, '14:00', 'p3', '核心穩定'],
  [3, '19:00', 'p2', '上肢體態'],
  [4, '10:00', 'p1', '伸展放鬆'],
  [5, '10:00', 'p3', '下肢雕塑'],
  [8, '19:00', 'p2', '下肢雕塑'],
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
