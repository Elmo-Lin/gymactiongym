import { request } from '../utils/api'
import { EXERCISES, INITIAL_BOOKINGS, INITIAL_STUDENTS, toISO } from './data.js'

// 教練後台的資料存取。畫面只呼叫這裡的方法，不需要知道資料存在哪裡：
//   createDemoApi   靜態模式：資料只在記憶體，重新整理就回到示範資料（原本 coachlog 的行為）
//   createRemoteApi dev／上線模式：透過後端讀寫 Firestore，每次呼叫都帶上教練登入的 token
//
// 資料格式（與 coachlog 相同）：
//   student：{ id, name, gender, age, goal, plans[], phone, note, total, remaining, history[], prs[], deletedAt }
//            deletedAt：刪除的時間（例如 2026-10-18T10:37），沒刪除是 null；刪除的學生可以復原
//   session：{ id, date, plan, exercises: [{ name, sets: [{ weight, reps }], pr? }], note }
//   pr：{ exercise, weight, date }，測驗出來的最大重量；exercise 上的 pr 是記錄當下的 PR，用來換算 %
//   booking（教練排的課，後端叫 lesson，和客人的線上預約分開）：{ id, date, time, studentId, plan, done }
//   exercises：教練的動作清單（記錄訓練時「新增動作」的選項），還沒改過時沿用 data.js 的 EXERCISES

const newId = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function createDemoApi() {
  return {
    demo: true,
    load: async () => ({ students: INITIAL_STUDENTS, bookings: INITIAL_BOOKINGS, exercises: EXERCISES }),
    importDemo: async () => ({ students: INITIAL_STUDENTS, bookings: INITIAL_BOOKINGS, exercises: EXERCISES }),
    createStudent: async (profile) => ({ ...profile, id: newId('s'), total: 0, remaining: 0, history: [], prs: [] }),
    updateStudent: async (id, profile) => ({ ...profile, id }),
    deleteStudent: async () => {
      const now = new Date()
      return { deletedAt: `${toISO(now)}T${now.toTimeString().slice(0, 5)}` }
    },
    restoreStudent: async () => null,
    purgeStudent: async () => null,
    addPackage: async () => null,
    setPackage: async () => null,
    savePr: async () => null,
    logSession: async (studentId, session) => ({ session: { ...session, id: newId(`${studentId}-`) } }),
    addBooking: async (booking) => ({ ...booking, id: newId('b'), done: false }),
    moveBooking: async () => null,
    deleteBooking: async () => ({}),
    saveExercises: async () => null,
  }
}

export function createRemoteApi(getToken) {
  const call = async (path, options = {}) => request(path, { ...options, token: await getToken() })
  // 後端把教練排的課叫 lessons，畫面沿用 coachlog 的 bookings
  const toScreen = (data) => ({ students: data.students, bookings: data.lessons, exercises: data.exercises ?? EXERCISES })

  return {
    demo: false,
    load: async () => toScreen(await call('/api/admin/data')),
    // 把 coachlog 的示範資料匯入資料庫（只有資料庫裡還沒有學生時才允許）
    importDemo: async () =>
      toScreen(await call('/api/admin/import', { method: 'POST', body: { students: INITIAL_STUDENTS, lessons: INITIAL_BOOKINGS } })),
    createStudent: (profile) => call('/api/admin/students', { method: 'POST', body: profile }),
    updateStudent: (id, profile) => call(`/api/admin/students/${id}`, { method: 'PUT', body: profile }),
    // 刪除只是移到「已刪除」，可以復原；永久刪除才會連同訓練紀錄與排課一起刪掉
    deleteStudent: (id) => call(`/api/admin/students/${id}`, { method: 'DELETE' }),
    restoreStudent: (id) => call(`/api/admin/students/${id}/restore`, { method: 'POST' }),
    purgeStudent: (id) => call(`/api/admin/students/${id}/permanent`, { method: 'DELETE' }),
    addPackage: (id, count) => call(`/api/admin/students/${id}/packages`, { method: 'POST', body: { count } }),
    // 直接設定堂數（按錯 +10 堂的復原、修改堂數）
    setPackage: (id, total, remaining) =>
      call(`/api/admin/students/${id}/package`, { method: 'PUT', body: { total, remaining } }),
    savePr: (id, pr) => call(`/api/admin/students/${id}/prs`, { method: 'POST', body: pr }),
    logSession: (studentId, session, bookingId) =>
      call(`/api/admin/students/${studentId}/sessions`, {
        method: 'POST',
        body: { date: session.date, plan: session.plan, exercises: session.exercises, note: session.note, bookingId },
      }),
    addBooking: (booking) => call('/api/admin/lessons', { method: 'POST', body: booking }),
    moveBooking: (id, date) => call(`/api/admin/lessons/${id}`, { method: 'PATCH', body: { date } }),
    deleteBooking: (id) => call(`/api/admin/lessons/${id}`, { method: 'DELETE' }),
    saveExercises: (exercises) => call('/api/admin/exercises', { method: 'PUT', body: { exercises } }),
  }
}
