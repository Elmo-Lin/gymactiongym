import { config } from '../config'
import { ApiError, request } from '../utils/api'
import { generateReference } from '../utils/booking'
import { findBooking, loadBookings, saveBooking } from '../utils/storage'

// 送出預約時，時段已經被其他人預約（後端回 409）
export class SlotTakenError extends Error {}

// 後端 BookingRequest 的格式：每週固定時，date 是第一堂的日期
const toRequest = (booking) => ({
  planId: booking.planId,
  mode: booking.mode,
  date: booking.mode === 'weekly' ? booking.startDate : booking.date,
  time: booking.time,
  weeks: booking.mode === 'weekly' ? booking.weeks : null,
  contact: booking.contact,
  partners: booking.partners,
  goal: booking.goal,
  experience: booking.experience,
  note: booking.note,
})

// 送出預約。靜態模式存在瀏覽器；其他模式送到後端，由後端確認時段、計算價格、產生預約編號
export async function submitBooking(booking) {
  if (!config.useApi) {
    const saved = { ...booking, reference: generateReference(), createdAt: new Date().toISOString() }
    saveBooking(saved)
    return saved
  }
  try {
    return await request('/api/bookings', { method: 'POST', body: toRequest(booking) })
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) throw new SlotTakenError()
    throw err
  }
}

// 查詢預約，找不到時回傳 null。後端回傳的電話、Email 會遮住一部分
export async function getBooking(reference) {
  if (!config.useApi) return (reference ? findBooking(reference) : loadBookings().slice(-1)[0]) ?? null
  if (!reference) return null
  return request(`/api/bookings/${encodeURIComponent(reference)}`, { allowNotFound: true })
}
