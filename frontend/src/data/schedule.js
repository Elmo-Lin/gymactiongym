// 每週固定課表（星期：0 = 週日 ... 6 = 週六）。
// 大部分學員都是固定每週同一時段上課：
//   type: 'group' → 已有固定學員的時段（planId 為該組方案，members 為目前人數）
//   type: 'open'  → 空堂，可預約任何方案
// 若固定班人數未滿（例如 1對3 只有 2 人），可單獨報名加入。

export const SESSION_MINUTES = 60
export const CLOSED_WEEKDAYS = [0]

export const weeklySchedule = {
  1: [
    { time: '07:00', type: 'group', planId: 'one-on-one', members: 1 },
    { time: '08:00', type: 'open' },
    { time: '10:00', type: 'group', planId: 'one-on-three', members: 2 },
    { time: '11:00', type: 'open' },
    { time: '14:00', type: 'open' },
    { time: '16:00', type: 'group', planId: 'one-on-one', members: 1 },
    { time: '18:00', type: 'group', planId: 'one-on-two', members: 2 },
    { time: '19:00', type: 'group', planId: 'one-on-three', members: 3 },
    { time: '20:00', type: 'group', planId: 'one-on-one', members: 1 },
  ],
  2: [
    { time: '07:00', type: 'open' },
    { time: '09:00', type: 'group', planId: 'one-on-two', members: 2 },
    { time: '10:00', type: 'open' },
    { time: '14:00', type: 'group', planId: 'one-on-one', members: 1 },
    { time: '15:00', type: 'open' },
    { time: '18:00', type: 'group', planId: 'one-on-one', members: 1 },
    { time: '19:00', type: 'group', planId: 'one-on-two', members: 2 },
    { time: '20:00', type: 'group', planId: 'one-on-three', members: 1 },
  ],
  3: [
    { time: '07:00', type: 'group', planId: 'one-on-one', members: 1 },
    { time: '08:00', type: 'open' },
    { time: '10:00', type: 'group', planId: 'one-on-three', members: 2 },
    { time: '11:00', type: 'open' },
    { time: '15:00', type: 'open' },
    { time: '16:00', type: 'open' },
    { time: '18:00', type: 'group', planId: 'one-on-two', members: 2 },
    { time: '19:00', type: 'group', planId: 'one-on-three', members: 3 },
    { time: '20:00', type: 'open' },
  ],
  4: [
    { time: '07:00', type: 'open' },
    { time: '09:00', type: 'group', planId: 'one-on-two', members: 2 },
    { time: '10:00', type: 'open' },
    { time: '14:00', type: 'open' },
    { time: '15:00', type: 'group', planId: 'one-on-one', members: 1 },
    { time: '18:00', type: 'group', planId: 'one-on-one', members: 1 },
    { time: '19:00', type: 'group', planId: 'one-on-two', members: 2 },
    { time: '20:00', type: 'group', planId: 'one-on-three', members: 2 },
  ],
  5: [
    { time: '07:00', type: 'group', planId: 'one-on-one', members: 1 },
    { time: '08:00', type: 'open' },
    { time: '10:00', type: 'open' },
    { time: '11:00', type: 'group', planId: 'one-on-two', members: 1 },
    { time: '14:00', type: 'open' },
    { time: '18:00', type: 'group', planId: 'one-on-three', members: 3 },
    { time: '19:00', type: 'open' },
    { time: '20:00', type: 'open' },
  ],
  6: [
    { time: '09:00', type: 'group', planId: 'one-on-three', members: 3 },
    { time: '10:00', type: 'group', planId: 'one-on-two', members: 2 },
    { time: '11:00', type: 'open' },
    { time: '13:00', type: 'open' },
    { time: '14:00', type: 'group', planId: 'one-on-one', members: 1 },
    { time: '15:00', type: 'open' },
    { time: '16:00', type: 'group', planId: 'one-on-three', members: 2 },
  ],
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
  instagram: '@action.gym.tw',
  hours: [
    { days: '週一至週五', time: '07:00 – 21:00' },
    { days: '週六', time: '09:00 – 17:00' },
    { days: '週日', time: '公休' },
  ],
}
