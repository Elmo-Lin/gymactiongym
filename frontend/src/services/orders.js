import { config } from '../config'
import { request } from '../utils/api'
import { generateReference } from '../utils/booking'
import { findOrder, loadOrders, saveOrder } from '../utils/storage'

// 送出訂單。靜態模式存在瀏覽器；其他模式送到後端，訂單編號與總金額由後端產生
export async function submitOrder({ contact, items }) {
  if (!config.useApi) {
    const order = {
      reference: generateReference().replace(/^AG/, 'OD'),
      createdAt: new Date().toISOString(),
      contact,
      items,
      total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    }
    saveOrder(order)
    return order
  }
  return request('/api/orders', { method: 'POST', body: { contact, items } })
}

// 查詢訂單，找不到時回傳 null
export async function getOrder(reference) {
  if (!config.useApi) return (reference ? findOrder(reference) : loadOrders().slice(-1)[0]) ?? null
  if (!reference) return null
  return request(`/api/orders/${encodeURIComponent(reference)}`, { allowNotFound: true })
}
