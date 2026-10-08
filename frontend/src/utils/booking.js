import { getPlan } from '../data/classes'
import { CLOSED_WEEKDAYS, SESSION_MINUTES, weeklySchedule } from '../data/schedule'
import { addDays, addMinutes, toDateTime, todayISO, weekdayOf } from './date'
import { loadBookings } from './storage'

export const BOOKING_STEPS = ['選擇方案', '選擇時段', '填寫資料', '確認預約', '完成']

export const STATUS_LABELS = {
  open: '空堂可預約',
  joinable: '固定班・可加入',
  full: '固定班・已額滿',
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

// 計算某一天所有時段的狀態（含本機已送出的預約）
export function getSlotsForDate(iso, bookings = loadBookings(), now = new Date()) {
  const template = weeklySchedule[weekdayOf(iso)] ?? []

  return template.map((base) => {
    const related = bookings.filter((b) => b.time === base.time && occursOn(b, iso))
    const added = related.reduce((sum, b) => sum + b.people, 0)
    const slot = {
      date: iso,
      time: base.time,
      endTime: addMinutes(base.time, SESSION_MINUTES),
      duration: SESSION_MINUTES,
      type: base.type,
      planId: base.planId ?? null,
      members: 0,
      capacity: 3,
      spotsLeft: 3,
    }

    if (base.type === 'group') {
      const plan = getPlan(base.planId)
      slot.capacity = plan.capacity
      slot.members = Math.min(base.members + added, plan.capacity)
      slot.spotsLeft = plan.capacity - slot.members
      slot.status = slot.spotsLeft > 0 ? 'joinable' : 'full'
    } else if (related.length > 0) {
      slot.planId = related[0].planId
      slot.members = added
      slot.spotsLeft = 0
      slot.status = 'taken'
    } else {
      slot.status = 'open'
    }

    if (toDateTime(iso, base.time) <= now) slot.status = 'past'
    return slot
  })
}

export const getSlot = (iso, time, bookings) => getSlotsForDate(iso, bookings).find((s) => s.time === time)

// 方案能否預約此時段：空堂可預約任何方案；未滿的固定班只能由相同方案加入（體驗課除外）
export function canBookSlot(slot, planId) {
  if (!slot) return false
  if (slot.status === 'open') return true
  if (slot.status === 'joinable') return planId !== 'trial' && slot.planId === planId
  return false
}

export const isJoiningSlot = (slot) => slot?.type === 'group'

export const peopleFor = (plan, joining) => (joining ? 1 : plan.capacity)

// 固定每週時段：檢查每一週是否都能上課，回傳衝突的日期
export function findWeeklyConflicts(startDate, time, weeks, planId, bookings = loadBookings()) {
  const conflicts = []
  for (let i = 0; i < weeks; i++) {
    const iso = addDays(startDate, i * 7)
    if (!canBookSlot(getSlot(iso, time, bookings), planId)) conflicts.push(iso)
  }
  return conflicts
}

// 固定每週：列出某星期某時段可開始的日期（未來 4 次）
export function weeklyStartOptions(weekday, time, weeks, planId, bookings = loadBookings()) {
  return nextOccurrences(weekday, 4).filter((iso) => findWeeklyConflicts(iso, time, weeks, planId, bookings).length === 0)
}

export function getUpcomingDates(count = 14, from = todayISO()) {
  return Array.from({ length: count }, (_, i) => addDays(from, i))
}

export function nextOccurrences(weekday, count = 4, from = todayISO()) {
  const offset = (weekday - weekdayOf(from) + 7) % 7
  return Array.from({ length: count }, (_, i) => addDays(from, offset + i * 7))
}

// 接下來幾天可預約的時段（課程介紹頁使用）
export function getUpcomingAvailable(planId, days = 7, limit = 6) {
  const bookings = loadBookings()
  const result = []
  for (const iso of getUpcomingDates(days)) {
    for (const slot of getSlotsForDate(iso, bookings)) {
      if (canBookSlot(slot, planId)) result.push(slot)
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
