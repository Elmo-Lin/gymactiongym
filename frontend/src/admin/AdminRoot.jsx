import { lazy, Suspense, useMemo } from 'react'
import { adminLogin, config } from '../config'
import CoachApp, { Loading } from './CoachApp.jsx'
import { createDemoApi, createRemoteApi } from './coachApi.js'

// 登入相關的程式（含 Firebase SDK）只有 Google 登入時才載入
const AuthGate = lazy(() => import('./AuthGate.jsx'))

// 靜態模式：不用登入，直接用 coachlog 的示範資料，不儲存
// dev／上線模式：依 config.js 的 adminLogin，不用登入直接讀寫 Firestore，或先用 Google 登入
export default function AdminRoot() {
  const demoApi = useMemo(() => createDemoApi(), [])
  // 不帶 token，後端要開放 app.admin.open
  const openApi = useMemo(() => createRemoteApi(async () => null), [])

  if (!config.useApi) return <CoachApp api={demoApi} user={null} onLogout={null} />
  if (adminLogin === 'none') return <CoachApp api={openApi} user={null} onLogout={null} />

  return (
    <Suspense fallback={<Loading />}>
      <AuthGate />
    </Suspense>
  )
}
