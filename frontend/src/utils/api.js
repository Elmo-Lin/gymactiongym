import { config } from '../config'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// 呼叫後端 API；allowNotFound 時 404 回傳 null，其他非 2xx 狀態丟出 ApiError。
// token：教練後台登入後的 Firebase ID token，會放在 Authorization 標頭給後端驗證
export async function request(path, { method = 'GET', body, allowNotFound = false, token } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(config.apiBaseUrl + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (allowNotFound && res.status === 404) return null
  if (!res.ok) throw new ApiError(`${method} ${path} 失敗（${res.status}）`, res.status)
  return res.status === 204 ? null : res.json()
}
