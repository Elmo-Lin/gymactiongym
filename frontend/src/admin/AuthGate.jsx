import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { useEffect, useMemo, useState } from 'react'
import { firebaseConfig } from '../config'
import CoachApp, { Splash } from './CoachApp.jsx'
import { createRemoteApi } from './coachApi.js'

const auth = firebaseConfig ? getAuth(initializeApp(firebaseConfig)) : null

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
          setError('登入失敗，請再試一次')
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
