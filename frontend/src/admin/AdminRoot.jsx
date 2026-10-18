import { lazy, Suspense, useMemo, useState } from 'react'
import { adminLogin, config } from '../config'
import CoachApp, { Splash } from './CoachApp.jsx'
import { createDemoApi } from './coachApi.js'

// 登入相關的程式（含 Firebase SDK）只有 dev／上線模式才載入，靜態模式不會下載
const AuthGate = lazy(() => import('./AuthGate.jsx'))

// 靜態模式：不用登入，直接用 coachlog 的示範資料
// dev／上線模式：依 config.js 的 adminLogin，示範登入，或先用 Google 登入再透過後端讀寫 Firestore
export default function AdminRoot() {
  const demoApi = useMemo(() => createDemoApi(), [])

  if (!config.useApi) return <CoachApp api={demoApi} user={null} onLogout={null} />
  if (adminLogin === 'demo') return <DemoLogin />

  return (
    <Suspense fallback={<Splash title="載入中…" />}>
      <AuthGate />
    </Suspense>
  )
}

// 示範登入：按一下就進入示範資料，方便展示。登出後回到登入畫面，再登入會是全新的示範資料
function DemoLogin() {
  const [api, setApi] = useState(null)

  if (!api) {
    return (
      <Splash title="教練登入">
        <p className="muted">示範版不需要帳號，操作的資料不會儲存。</p>
        <button className="btn btn-ink btn-lg" onClick={() => setApi(createDemoApi())}>
          示範登入
        </button>
      </Splash>
    )
  }

  return <CoachApp api={api} user={null} onLogout={() => setApi(null)} />
}
