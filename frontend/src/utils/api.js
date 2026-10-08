import { config } from '../config'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// 呼叫後端 API；allowNotFound 時 404 回傳 null，其他非 2xx 狀態丟出 ApiError
export async function request(path, { method = 'GET', body, allowNotFound = false } = {}) {
  const res = await fetch(config.apiBaseUrl + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (allowNotFound && res.status === 404) return null
  if (!res.ok) throw new ApiError(`${method} ${path} 失敗（${res.status}）`, res.status)
  return res.json()
}
