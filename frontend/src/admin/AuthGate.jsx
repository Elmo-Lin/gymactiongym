import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { useEffect, useMemo, useState } from 'react'
import { firebaseConfig } from '../config'
import CoachApp, { Splash } from './CoachApp.jsx'
import { createRemoteApi } from './coachApi.js'

const auth = firebaseConfig ? getAuth(initializeApp(firebaseConfig)) : null

// 常見的登入錯誤與處理方式，直接顯示在畫面上，不用打開開發者工具查
const LOGIN_ERRORS = {
  'auth/operation-not-allowed': 'Google 登入尚未啟用：請到 Firebase Console → Authentication → 登入方式，啟用 Google。',
  'auth/configuration-not-found': 'Authentication 尚未啟用：請到 Firebase Console → Authentication 點「開始使用」，再啟用 Google。',
  'auth/unauthorized-domain': `這個網域（${window.location.hostname}）不在授權網域裡：請到 Firebase Console → Authentication → 設定 → 授權網域加入。`,
  'auth/popup-blocked': '瀏覽器擋住了登入視窗，請允許這個網站開啟彈出式視窗後再試一次。',
  'auth/network-request-failed': '網路連線失敗，請確認網路後再試一次。',
}

// 教練用 Google 帳號登入（Firebase Authentication）。
// 前端只負責登入並取得 ID token；能不能看資料由後端檢查 token 與允許名單決定
export default function AuthGate() {
  const [user, setUser] = useState(undefined) // undefined：確認登入狀態中；null：未登入
  const [error, setError] = useState(null)

  useEffect(() => (auth ? onAuthStateChanged(auth, setUser) : undefined), [])

  // 每次呼叫後端都取用最新的 token（Firebase 會在過期前自動更新）
  const api = useMemo(() => user && createRemoteApi(() => user.getIdToken()), [user])

  if (!auth) {
    return (
      <Splash title="尚未設定 Google 登入">
        <p className="muted">請在 frontend/src/config.js 填入 firebaseConfig（Firebase Console → 專案設定 → 你的應用程式）。</p>
      </Splash>
    )
  }

  if (user === undefined) return <Splash title="載入中…" />

  if (!user) {
    const login = async () => {
      setError(null)
      try {
        await signInWithPopup(auth, new GoogleAuthProvider())
      } catch (err) {
        // 使用者自己關掉登入視窗不算錯誤
        if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
          setError(LOGIN_ERRORS[err.code] ?? `登入失敗，請再試一次（${err.code ?? err.message}）`)
        }
      }
    }
    return (
      <Splash title="教練登入">
        <p className="muted">請使用教練的 Google 帳號登入。</p>
        <button className="btn btn-ink btn-lg" onClick={login}>
          使用 Google 帳號登入
        </button>
        {error && <p className="splash-error">{error}</p>}
      </Splash>
    )
  }

  // key：換帳號登入時重新建立後台，不會留著上一個帳號的資料
  return <CoachApp key={user.uid} api={api} user={user} onLogout={() => signOut(auth)} />
}
