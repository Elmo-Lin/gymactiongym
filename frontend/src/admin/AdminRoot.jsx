import { lazy, Suspense, useMemo } from 'react'
import { config } from '../config'
import CoachApp, { Splash } from './CoachApp.jsx'
import { createDemoApi } from './coachApi.js'

// 登入相關的程式（含 Firebase SDK）只有 dev／上線模式才載入，靜態模式不會下載
const AuthGate = lazy(() => import('./AuthGate.jsx'))

// 靜態模式：不用登入，直接用 coachlog 的示範資料
// dev／上線模式：先用 Google 登入，再透過後端讀寫 Firestore
export default function AdminRoot() {
  const demoApi = useMemo(() => createDemoApi(), [])

  if (!config.useApi) return <CoachApp api={demoApi} user={null} onLogout={null} />

  return (
    <Suspense fallback={<Splash title="載入中…" />}>
      <AuthGate />
    </Suspense>
  )
}
