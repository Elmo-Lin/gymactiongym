// 每週課表（星期：0 = 週日 ... 6 = 週六），需與後端 WeeklySchedule.java 保持一致。
// 一個時段只屬於一位會員：由會員決定 1對1 或 1對2，同行的人是自己帶的朋友，不會和不認識的人一起上課。
//   type: 'fixed' → 固定學員每週都會來上課的時段，顯示為已被預約
//   type: 'open'  → 空堂，可以預約

export const SESSION_MINUTES = 60
export const CLOSED_WEEKDAYS = [0]

// 目前所有時段都是空堂。要把某個時段保留給固定學員，把它改成 { time: '07:00', type: 'fixed' }，
// 並同步修改後端 WeeklySchedule.java
const open = (time) => ({ time, type: 'open' })

export const weeklySchedule = {
  1: ['07:00', '08:00', '10:00', '11:00', '14:00', '16:00', '18:00', '19:00', '20:00'].map(open),
  2: ['07:00', '09:00', '10:00', '14:00', '15:00', '18:00', '19:00', '20:00'].map(open),
  3: ['07:00', '08:00', '10:00', '11:00', '15:00', '16:00', '18:00', '19:00', '20:00'].map(open),
  4: ['07:00', '09:00', '10:00', '14:00', '15:00', '18:00', '19:00', '20:00'].map(open),
  5: ['07:00', '08:00', '10:00', '11:00', '14:00', '18:00', '19:00', '20:00'].map(open),
  6: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map(open),
  0: [],
}

export const studioInfo = {
  name: '即動 ACTION GYM 楊梅店',
  address: '326 桃園市楊梅區楊江里光華街 8 號',
  phone: '0962-071-332',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=%E5%8D%B3%E5%8B%95+action+gym+%E6%A5%8A%E6%A2%85%E5%BA%97',
  rating: { score: '5.0', count: 23 },
  line: '@actiongym',
  email: 'hello@actiongym.tw',
  instagram: '@gymactiongym',
  instagramUrl: 'https://www.instagram.com/gymactiongym/',
  hours: [
    { days: '週一至週五', time: '07:00 – 21:00' },
    { days: '週六', time: '09:00 – 17:00' },
    { days: '週日', time: '公休' },
  ],
}
