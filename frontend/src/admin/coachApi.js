import { request } from '../utils/api'
import { INITIAL_BOOKINGS, INITIAL_STUDENTS } from './data.js'

// 教練後台的資料存取。畫面只呼叫這裡的方法，不需要知道資料存在哪裡：
//   createDemoApi   靜態模式：資料只在記憶體，重新整理就回到示範資料（原本 coachlog 的行為）
//   createRemoteApi dev／上線模式：透過後端讀寫 Firestore，每次呼叫都帶上教練登入的 token
//
// 資料格式（與 coachlog 相同）：
//   student：{ id, name, gender, age, goal, plans[], phone, note, total, remaining, history[] }
//   session：{ id, date, plan, exercises: [{ name, sets: [{ weight, reps }] }], note }
//   booking（教練排的課，後端叫 lesson，和客人的線上預約分開）：{ id, date, time, studentId, plan, done }

const newId = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export function createDemoApi() {
  return {
    demo: true,
    load: async () => ({ students: INITIAL_STUDENTS, bookings: INITIAL_BOOKINGS }),
    importDemo: async () => ({ students: INITIAL_STUDENTS, bookings: INITIAL_BOOKINGS }),
    createStudent: async (profile) => ({ ...profile, id: newId('s'), total: 0, remaining: 0, history: [] }),
    updateStudent: async (id, profile) => ({ ...profile, id }),
    addPackage: async () => null,
    logSession: async (studentId, session) => ({ session: { ...session, id: newId(`${studentId}-`) } }),
    addBooking: async (booking) => ({ ...booking, id: newId('b'), done: false }),
    moveBooking: async () => null,
  }
}

export function createRemoteApi(getToken) {
  const call = async (path, options = {}) => request(path, { ...options, token: await getToken() })
  // 後端把教練排的課叫 lessons，畫面沿用 coachlog 的 bookings
  const toScreen = (data) => ({ students: data.students, bookings: data.lessons })

  return {
    demo: false,
    load: async () => toScreen(await call('/api/admin/data')),
    // 把 coachlog 的示範資料匯入資料庫（只有資料庫裡還沒有學生時才允許）
    importDemo: async () =>
      toScreen(await call('/api/admin/import', { method: 'POST', body: { students: INITIAL_STUDENTS, lessons: INITIAL_BOOKINGS } })),
    createStudent: (profile) => call('/api/admin/students', { method: 'POST', body: profile }),
    updateStudent: (id, profile) => call(`/api/admin/students/${id}`, { method: 'PUT', body: profile }),
    addPackage: (id, count) => call(`/api/admin/students/${id}/packages`, { method: 'POST', body: { count } }),
    logSession: (studentId, session, bookingId) =>
      call(`/api/admin/students/${studentId}/sessions`, {
        method: 'POST',
        body: { date: session.date, plan: session.plan, exercises: session.exercises, note: session.note, bookingId },
      }),
    addBooking: (booking) => call('/api/admin/lessons', { method: 'POST', body: booking }),
    moveBooking: (id, date) => call(`/api/admin/lessons/${id}`, { method: 'PATCH', body: { date } }),
  }
}
