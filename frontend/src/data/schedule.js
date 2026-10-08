// 每週課表（星期：0 = 週日 ... 6 = 週六），需與後端 WeeklySchedule.java 保持一致。
// 一個時段只屬於一位會員：由會員決定 1對1 或 1對2，同行的人是自己帶的朋友，不會和不認識的人一起上課。
//   type: 'fixed' → 固定學員每週都會來上課的時段，顯示為已被預約
//   type: 'open'  → 空堂，可以預約

export const SESSION_MINUTES = 60
export const CLOSED_WEEKDAYS = [0]

const open = (time) => ({ time, type: 'open' })
const fixed = (time) => ({ time, type: 'fixed' })

export const weeklySchedule = {
  1: [fixed('07:00'), open('08:00'), fixed('10:00'), open('11:00'), open('14:00'), fixed('16:00'), fixed('18:00'), fixed('19:00'), fixed('20:00')],
  2: [open('07:00'), fixed('09:00'), open('10:00'), fixed('14:00'), open('15:00'), fixed('18:00'), fixed('19:00'), fixed('20:00')],
  3: [fixed('07:00'), open('08:00'), fixed('10:00'), open('11:00'), open('15:00'), open('16:00'), fixed('18:00'), fixed('19:00'), open('20:00')],
  4: [open('07:00'), fixed('09:00'), open('10:00'), open('14:00'), fixed('15:00'), fixed('18:00'), fixed('19:00'), fixed('20:00')],
  5: [fixed('07:00'), open('08:00'), open('10:00'), fixed('11:00'), open('14:00'), fixed('18:00'), open('19:00'), open('20:00')],
  6: [fixed('09:00'), fixed('10:00'), open('11:00'), open('13:00'), fixed('14:00'), open('15:00'), fixed('16:00')],
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
