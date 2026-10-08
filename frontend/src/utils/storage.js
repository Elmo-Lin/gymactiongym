// 預約資料只存在瀏覽器（localStorage），之後可改為呼叫後端 API。
const BOOKINGS_KEY = 'action-gym:bookings'

const read = (storage, key, fallback) => {
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // 無痕模式或儲存空間已滿時忽略
  }
}

const remove = (storage, key) => {
  try {
    storage.removeItem(key)
  } catch {
    // ignore
  }
}

const local = () => (typeof window === 'undefined' ? null : window.localStorage)
const session = () => (typeof window === 'undefined' ? null : window.sessionStorage)

export const loadBookings = () => {
  const s = local()
  const list = s ? read(s, BOOKINGS_KEY, []) : []
  return Array.isArray(list) ? list : []
}

export const saveBooking = (booking) => {
  const s = local()
  if (s) write(s, BOOKINGS_KEY, [...loadBookings(), booking])
}

export const findBooking = (reference) => loadBookings().find((b) => b.reference === reference)

export const loadDraft = (key) => {
  const s = session()
  return s ? read(s, key, null) : null
}

export const saveDraft = (key, value) => {
  const s = session()
  if (s) write(s, key, value)
}

export const clearDraft = (key) => {
  const s = session()
  if (s) remove(s, key)
}

// 購物車與訂單同樣只存在瀏覽器
const CART_KEY = 'action-gym:cart'
const ORDERS_KEY = 'action-gym:orders'

export const loadCart = () => {
  const s = local()
  const list = s ? read(s, CART_KEY, []) : []
  return Array.isArray(list) ? list : []
}

export const saveCart = (items) => {
  const s = local()
  if (s) write(s, CART_KEY, items)
}

export const loadOrders = () => {
  const s = local()
  const list = s ? read(s, ORDERS_KEY, []) : []
  return Array.isArray(list) ? list : []
}

export const saveOrder = (order) => {
  const s = local()
  if (s) write(s, ORDERS_KEY, [...loadOrders(), order])
}

export const findOrder = (reference) => loadOrders().find((o) => o.reference === reference)
