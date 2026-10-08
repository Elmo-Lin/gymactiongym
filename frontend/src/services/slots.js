import { useEffect, useMemo, useState } from 'react'
import { config } from '../config'
import { request } from '../utils/api'
import { localSlotIndex } from '../utils/booking'
import { loadBookings } from '../utils/storage'

// 預約流程要檢查的最遠日期：每週固定 12 週、最晚 4 週後開始，約 15 週（後端一次最多查 120 天）
export const BOOKING_RANGE_DAYS = 111

// 把 API 回傳的時段清單整理成時段表 { 日期: 時段[] }
async function fetchSlotIndex(from, to) {
  const slots = await request(`/api/slots?from=${from}&to=${to}`)
  const index = {}
  for (const slot of slots) {
    if (!index[slot.date]) index[slot.date] = []
    index[slot.date].push(slot)
  }
  return index
}

// 取得 from～to 的時段表。
// 靜態模式：用課表 + 這個瀏覽器送出的預約自己算。
// 其他模式：呼叫 GET /api/slots；拿到資料前先顯示只依固定課表算出的狀態，失敗時 error 為 true。
// reload() 會重新向後端查詢，例如送出預約時發現時段已被搶走
export function useSlots(from, to) {
  const local = useMemo(() => localSlotIndex(from, to, config.useApi ? [] : loadBookings()), [from, to])
  const [version, setVersion] = useState(0)
  const key = `${from}~${to}#${version}`
  const [remote, setRemote] = useState({ key: null, index: null, error: false })
  const reload = () => setVersion((v) => v + 1)

  useEffect(() => {
    if (!config.useApi) return
    let ignore = false
    fetchSlotIndex(from, to)
      .then((index) => !ignore && setRemote({ key, index, error: false }))
      .catch(() => !ignore && setRemote({ key, index: null, error: true }))
    return () => {
      ignore = true
    }
  }, [from, to, key])

  if (!config.useApi) return { index: local, loading: false, error: false, reload }
  const loaded = remote.key === key
  return { index: loaded && remote.index ? remote.index : local, loading: !loaded, error: loaded && remote.error, reload }
}
