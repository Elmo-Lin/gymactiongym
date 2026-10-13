import { useCallback, useEffect, useRef, useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import Students from './components/Students.jsx'
import StudentDetail from './components/StudentDetail.jsx'
import StudentForm from './components/StudentForm.jsx'
import LogSession from './components/LogSession.jsx'
import Schedule from './components/Schedule.jsx'
import { Icon } from './components/ui.jsx'

const TABS = [
  { id: 'today', label: '今天', icon: 'home' },
  { id: 'students', label: '學生', icon: 'users' },
  { id: 'schedule', label: '排課', icon: 'calendar' },
]

// 教練後台（原 CoachLog）。資料一律透過 api 讀寫，api 決定資料存在記憶體（示範）或後端（Firestore）。
// user、onLogout：登入後的教練帳號，靜態模式沒有登入，兩者皆為 null
export default function CoachApp({ api, user, onLogout }) {
  const [students, setStudents] = useState(null)
  const [bookings, setBookings] = useState([])
  const [exercises, setExercises] = useState([])
  const [loadError, setLoadError] = useState(null)
  // route: { tab } 或 { tab, studentId } 或 { tab, studentId, log: true, bookingId } 或 { tab, form: 'new' | 'edit', studentId }
  const [route, setRoute] = useState({ tab: 'today' })
  const [toast, setToast] = useState(null)
  const [importing, setImporting] = useState(false)
  const toastTimer = useRef()

  const reload = useCallback(
    () =>
      api.load().then(
        (data) => {
          setStudents(data.students)
          setBookings(data.bookings)
          setExercises(data.exercises)
          setLoadError(null)
        },
        (err) => setLoadError(err),
      ),
    [api],
  )

  useEffect(() => {
    reload()
  }, [reload])

  // action: { label, run }，例如「復原」
  const showToast = (message, action) => {
    setToast({ message, action })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), action ? 5000 : 2600)
  }

  // 先更新畫面再存檔；存檔失敗就提示並重新載入，讓畫面和資料庫一致
  const persist = (promise) =>
    promise.catch(() => {
      showToast('儲存失敗，已重新載入資料')
      reload()
    })

  const go = (next) => {
    setRoute(next)
    window.scrollTo({ top: 0 })
  }

  if (loadError) {
    const denied = loadError.status === 401 || loadError.status === 403
    return (
      <Splash title={denied ? '這個帳號沒有後台權限' : '資料載入失敗'} user={user} onLogout={onLogout}>
        {denied ? (
          <p className="muted">請改用教練的 Google 帳號登入，或請管理員把這個帳號加入允許名單。</p>
        ) : (
          <button className="btn btn-ink" onClick={reload}>
            重新載入
          </button>
        )}
      </Splash>
    )
  }

  if (!students) return <Splash title="載入中…" />

  const openStudent = (studentId) => go({ tab: route.tab, studentId })
  const startLog = (studentId, bookingId) => go({ tab: route.tab, studentId, log: true, bookingId })

  const saveSession = async (studentId, session, bookingId) => {
    try {
      const { session: saved } = await api.logSession(studentId, session, bookingId)
      const student = students.find((s) => s.id === studentId)
      const remaining = Math.max(0, student.remaining - 1)
      setStudents((list) =>
        list.map((s) => (s.id === studentId ? { ...s, remaining, history: [...s.history, saved] } : s)),
      )
      if (bookingId) {
        setBookings((list) => list.map((b) => (b.id === bookingId ? { ...b, done: true } : b)))
      }
      showToast(`已儲存 ${student.name} 的訓練紀錄，扣 1 堂（剩 ${remaining} 堂）`)
      go({ tab: route.tab, studentId })
    } catch {
      showToast('訓練紀錄儲存失敗，請再試一次')
    }
  }

  const addPackage = (studentId, count) => {
    setStudents((list) =>
      list.map((s) => (s.id === studentId ? { ...s, total: s.total + count, remaining: s.remaining + count } : s)),
    )
    const student = students.find((s) => s.id === studentId)
    showToast(`${student.name} 已購買 ${count} 堂課`)
    persist(api.addPackage(studentId, count))
  }

  // PR：同一個動作同一天只留一筆，再輸入一次就蓋過（和後端的規則相同）
  const savePr = (studentId, pr) => {
    setStudents((list) =>
      list.map((s) => {
        if (s.id !== studentId) return s
        const others = (s.prs ?? []).filter((p) => !(p.exercise === pr.exercise && p.date === pr.date))
        return { ...s, prs: [...others, pr].sort((a, b) => a.date.localeCompare(b.date)) }
      }),
    )
    const student = students.find((s) => s.id === studentId)
    showToast(`已更新 ${student.name} 的${pr.exercise} PR：${pr.weight} kg`)
    persist(api.savePr(studentId, pr))
  }

  const saveStudent = async (profile) => {
    try {
      if (route.form === 'edit') {
        const updated = await api.updateStudent(route.studentId, profile)
        setStudents((list) =>
          list.map((s) => (s.id === route.studentId ? { ...s, ...updated, history: s.history, prs: s.prs } : s)),
        )
        showToast(`已更新 ${profile.name} 的資料`)
        go({ tab: route.tab, studentId: route.studentId })
      } else {
        const created = await api.createStudent(profile)
        setStudents((list) => [...list, created])
        showToast(`已新增學生 ${created.name}`)
        go({ tab: 'students', studentId: created.id })
      }
    } catch {
      showToast('學生資料儲存失敗，請再試一次')
    }
  }

  const importDemo = async () => {
    setImporting(true)
    try {
      const data = await api.importDemo()
      setStudents(data.students)
      setBookings(data.bookings)
      setExercises(data.exercises)
      showToast(`已匯入 ${data.students.length} 位示範學生`)
    } catch {
      showToast('匯入失敗，請再試一次')
    } finally {
      setImporting(false)
    }
  }

  const addBooking = async (booking) => {
    try {
      const created = await api.addBooking(booking)
      setBookings((list) => [...list, created])
      const student = students.find((s) => s.id === booking.studentId)
      showToast(`已為 ${student.name} 排課：${booking.date.slice(5).replace('-', '/')} ${booking.time}`)
    } catch {
      showToast('排課失敗，請再試一次')
    }
  }

  const moveBooking = (bookingId, date) => {
    const booking = bookings.find((b) => b.id === bookingId)
    const student = students.find((s) => s.id === booking.studentId)
    const clash = bookings.find((b) => b.id !== bookingId && b.date === date && b.time === booking.time)
    setBookings((list) => list.map((b) => (b.id === bookingId ? { ...b, date } : b)))
    persist(api.moveBooking(bookingId, date))
    const when = `${date.slice(5).replace('-', '/')} ${booking.time}`
    const clashName = clash && students.find((s) => s.id === clash.studentId)?.name
    showToast(clash ? `已將 ${student.name} 改到 ${when}（注意：與 ${clashName} 時間重疊）` : `已將 ${student.name} 改到 ${when}`, {
      label: '復原',
      run: () => {
        setBookings((list) => list.map((b) => (b.id === bookingId ? { ...b, date: booking.date } : b)))
        persist(api.moveBooking(bookingId, booking.date))
        setToast(null)
      },
    })
  }

  // 教練的動作清單：新增自訂動作或移除不用的動作，畫面先更新再存檔
  const saveExercises = (list) => {
    setExercises(list)
    persist(api.saveExercises(list))
  }

  const current = route.studentId && students.find((s) => s.id === route.studentId)

  let page
  if (route.form) {
    page = (
      <StudentForm
        key={route.form + (route.studentId ?? '')}
        student={route.form === 'edit' ? current : null}
        onCancel={() => go(route.form === 'edit' ? { tab: route.tab, studentId: route.studentId } : { tab: route.tab })}
        onSave={saveStudent}
      />
    )
  } else if (current && route.log) {
    page = (
      <LogSession
        key={current.id}
        student={current}
        booking={bookings.find((b) => b.id === route.bookingId)}
        library={exercises}
        onLibraryChange={saveExercises}
        onCancel={() => go({ tab: route.tab, studentId: current.id })}
        onSave={(session) => saveSession(current.id, session, route.bookingId)}
      />
    )
  } else if (current) {
    page = (
      <StudentDetail
        key={current.id}
        student={current}
        bookings={bookings}
        onBack={() => go({ tab: route.tab })}
        onLog={() => startLog(current.id)}
        onEdit={() => go({ tab: route.tab, studentId: current.id, form: 'edit' })}
        onAddPackage={(n) => addPackage(current.id, n)}
        library={exercises}
        onSavePr={(pr) => savePr(current.id, pr)}
      />
    )
  } else if (students.length === 0) {
    page = (
      <Welcome
        demo={api.demo}
        importing={importing}
        onCreate={() => go({ tab: 'students', form: 'new' })}
        onImport={importDemo}
      />
    )
  } else if (route.tab === 'students') {
    page = <Students students={students} onOpen={openStudent} onCreate={() => go({ tab: 'students', form: 'new' })} />
  } else if (route.tab === 'schedule') {
    page = (
      <Schedule
        students={students}
        bookings={bookings}
        onOpen={openStudent}
        onLog={startLog}
        onAddBooking={addBooking}
        onMoveBooking={moveBooking}
      />
    )
  } else {
    page = (
      <Dashboard
        students={students}
        bookings={bookings}
        onOpen={openStudent}
        onLog={startLog}
        onAddPackage={addPackage}
        onTab={(tab) => go({ tab })}
      />
    )
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          即動<span>教練後台</span>
        </div>
        <nav className="topnav">
          {TABS.map((t) => (
            <button key={t.id} className={route.tab === t.id ? 'active' : ''} onClick={() => go({ tab: t.id })}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="topbar-meta">
          <Account demo={api.demo} user={user} onLogout={onLogout} />
        </div>
      </header>

      <main className="main">
        <div className="account-bar">
          <Account demo={api.demo} user={user} onLogout={onLogout} />
        </div>
        {page}
      </main>

      {!route.log && !route.form && (
        <nav className="tabbar">
          {TABS.map((t) => (
            <button key={t.id} className={route.tab === t.id ? 'active' : ''} onClick={() => go({ tab: t.id })}>
              <Icon name={t.icon} size={22} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}

      {toast && (
        <div className="toast" role="status">
          <span>{toast.message}</span>
          {toast.action && (
            <button className="toast-action" onClick={toast.action.run}>
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// 目前的帳號：示範模式提醒資料不會儲存；登入後顯示 Email 與登出
function Account({ demo, user, onLogout }) {
  if (demo) return <span className="demo-badge">示範模式・資料不會儲存</span>
  if (!user) return null
  return (
    <span className="account">
      {user.email}
      <button className="text-btn" onClick={onLogout}>
        登出
      </button>
    </span>
  )
}

// 還沒有學生時：新增第一位學生，或匯入 coachlog 的示範資料
function Welcome({ demo, importing, onCreate, onImport }) {
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>歡迎使用教練後台</h1>
        </div>
      </header>
      <section className="block welcome">
        <p>還沒有任何學生。新增第一位學生後，就可以開始排課、記錄訓練。</p>
        <div className="btn-row">
          <button className="btn btn-ink btn-lg" onClick={onCreate}>
            新增學生
          </button>
          {!demo && (
            <button className="btn btn-line btn-lg" onClick={onImport} disabled={importing}>
              {importing ? '匯入中…' : '匯入示範資料'}
            </button>
          )}
        </div>
        {!demo && <p className="muted">示範資料包含 8 位學生、訓練紀錄與兩週的排課，方便先試用各項功能。</p>}
      </section>
    </div>
  )
}

// 載入中、錯誤等全頁狀態
export function Splash({ title, children, user, onLogout }) {
  return (
    <div className="splash">
      <div className="brand">
        即動<span>教練後台</span>
      </div>
      <h1>{title}</h1>
      {children}
      {user && (
        <p className="account">
          {user.email}
          <button className="text-btn" onClick={onLogout}>
            登出
          </button>
        </p>
      )}
    </div>
  )
}
