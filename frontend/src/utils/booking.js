import { CLOSED_WEEKDAYS, SESSION_MINUTES, weeklySchedule } from '../data/schedule'
import { addDays, addMinutes, toDateTime, todayISO, weekdayOf } from './date'

export const BOOKING_STEPS = ['選擇方案', '選擇時段', '填寫資料', '確認預約', '完成']

export const STATUS_LABELS = {
  open: '空堂可預約',
  taken: '已被預約',
  past: '已結束',
}

export const isClosedDay = (iso) => CLOSED_WEEKDAYS.includes(weekdayOf(iso))

const lastDateOf = (booking) =>
  booking.mode === 'weekly' ? addDays(booking.startDate, (booking.weeks - 1) * 7) : booking.date

const occursOn = (booking, iso) => {
  if (booking.mode === 'single') return booking.date === iso
  return weekdayOf(booking.startDate) === weekdayOf(iso) && iso >= booking.startDate && iso <= lastDateOf(booking)
}

// 計算某一天所有時段的狀態（靜態模式：固定學員的時段 + 這個瀏覽器送出的預約）。
// 規則與後端 SlotService.toSlot 相同：已開始 → past；固定學員或已有預約 → taken；其餘 → open
export function getSlotsForDate(iso, bookings = [], now = new Date()) {
  const template = weeklySchedule[weekdayOf(iso)] ?? []

  return template.map((base) => {
    let status = 'open'
    if (toDateTime(iso, base.time) <= now) status = 'past'
    else if (base.type === 'fixed' || bookings.some((b) => b.time === base.time && occursOn(b, iso))) status = 'taken'

    return {
      date: iso,
      time: base.time,
      endTime: addMinutes(base.time, SESSION_MINUTES),
      duration: SESSION_MINUTES,
      status,
    }
  })
}

// 時段表：{ '2026-10-12': [時段, ...], ... }。靜態模式由 localSlotIndex 算出，其他模式由 GET /api/slots 取得
export function localSlotIndex(from, to, bookings = []) {
  const index = {}
  for (let iso = from; iso <= to; iso = addDays(iso, 1)) index[iso] = getSlotsForDate(iso, bookings)
  return index
}

// 時段表範圍外的日期視為沒有時段
export const slotsOn = (index, iso) => index[iso] ?? []

export const getSlot = (index, iso, time) => slotsOn(index, iso).find((s) => s.time === time)

// 一個時段只屬於一位會員，所以只有空堂可以預約，任何方案都可以
export const canBookSlot = (slot) => slot?.status === 'open'

// 固定每週時段：檢查每一週是否都能上課，回傳衝突的日期
export function findWeeklyConflicts(index, startDate, time, weeks) {
  const conflicts = []
  for (let i = 0; i < weeks; i++) {
    const iso = addDays(startDate, i * 7)
    if (!canBookSlot(getSlot(index, iso, time))) conflicts.push(iso)
  }
  return conflicts
}

// 固定每週：列出某星期某時段可開始的日期（未來 4 次）
export function weeklyStartOptions(index, weekday, time, weeks) {
  return nextOccurrences(weekday, 4).filter((iso) => findWeeklyConflicts(index, iso, time, weeks).length === 0)
}

export function getUpcomingDates(count = 14, from = todayISO()) {
  return Array.from({ length: count }, (_, i) => addDays(from, i))
}

export function nextOccurrences(weekday, count = 4, from = todayISO()) {
  const offset = (weekday - weekdayOf(from) + 7) % 7
  return Array.from({ length: count }, (_, i) => addDays(from, offset + i * 7))
}

// 接下來幾天可預約的時段（課程介紹頁使用）
export function getUpcomingAvailable(index, days = 7, limit = 6) {
  const result = []
  for (const iso of getUpcomingDates(days)) {
    for (const slot of slotsOn(index, iso)) {
      if (canBookSlot(slot)) result.push(slot)
      if (result.length >= limit) return result
    }
  }
  return result
}

export function calcPrice(plan, people, sessions, discount = 1) {
  const perSession = plan.price * people
  const subtotal = perSession * sessions
  const total = Math.round(subtotal * discount)
  return { perSession, subtotal, total, saved: subtotal - total }
}

export const formatPrice = (n) => `NT$${n.toLocaleString('en-US')}`

export function generateReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const d = todayISO().replaceAll('-', '').slice(2)
  const rand = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `AG${d}-${rand}`
}
