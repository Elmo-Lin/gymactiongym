import { useCallback, useEffect, useRef, useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import Students from './components/Students.jsx'
import StudentDetail from './components/StudentDetail.jsx'
import StudentForm from './components/StudentForm.jsx'
import LogSession from './components/LogSession.jsx'
import PilatesLogSession from './components/PilatesLogSession.jsx'
import Schedule from './components/Schedule.jsx'
import { Icon } from './components/ui.jsx'
import { PROGRAMS, programOf } from './data.js'

// 上次看的是健身還是皮拉提斯，下次打開後台時沿用
const PROGRAM_KEY = 'coach:program'
const loadProgram = () => {
  try {
    return PROGRAMS[localStorage.getItem(PROGRAM_KEY)] ? localStorage.getItem(PROGRAM_KEY) : 'fitness'
  } catch {
    return 'fitness'
  }
}

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
  const [exercises, setExercises] = useState({ fitness: [], pilates: [] })
  // 目前看的是健身還是皮拉提斯：兩邊的學生、堂數、排課與訓練紀錄完全分開
  const [program, setProgram] = useState(loadProgram)
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

  const switchProgram = (id) => {
    setProgram(id)
    try {
      localStorage.setItem(PROGRAM_KEY, id)
    } catch {
      // 無痕模式等情況存不了，下次打開回到健身
    }
    go({ tab: route.tab })
  }

  // 只顯示目前類別的學生；刪除的學生和他的課都不出現在各個畫面，只在學生名單最下面的「已刪除」
  const config = PROGRAMS[program]
  const programStudents = students.filter((s) => programOf(s) === program)
  const activeStudents = programStudents.filter((s) => !s.deletedAt)
  const deletedStudents = programStudents.filter((s) => s.deletedAt)
  const activeBookings = bookings.filter((b) => activeStudents.some((s) => s.id === b.studentId))
  const current = route.studentId && activeStudents.find((s) => s.id === route.studentId)
  const library = exercises[program]

  const openStudent = (studentId) => go({ tab: route.tab, studentId })
  const startLog = (studentId, bookingId) => go({ tab: route.tab, studentId, log: true, bookingId })

  const saveSession = async (studentId, session, bookingId) => {
    try {
      // 堂數在排課時扣，記錄不扣；後端回傳的 remaining 只有舊的課（改規則前排的）補扣時會變
      const { session: saved, remaining: left } = await api.logSession(studentId, session, bookingId)
      const student = students.find((s) => s.id === studentId)
      const remaining = left ?? student.remaining
      setStudents((list) =>
        list.map((s) => (s.id === studentId ? { ...s, remaining, history: [...s.history, saved].sort((a, b) => a.date.localeCompare(b.date)) } : s)),
      )
      if (bookingId) {
        setBookings((list) => list.map((b) => (b.id === bookingId ? { ...b, done: true } : b)))
      }
      showToast(`已儲存 ${student.name} 的訓練紀錄`)
      go({ tab: route.tab, studentId })
    } catch {
      showToast('訓練紀錄儲存失敗，請再試一次')
    }
  }

  // 購買堂數；按錯了可以在提示訊息上復原（把堂數改回購買前）
  const addPackage = (studentId, count) => {
    const student = students.find((s) => s.id === studentId)
    setStudents((list) =>
      list.map((s) => (s.id === studentId ? { ...s, total: s.total + count, remaining: s.remaining + count } : s)),
    )
    persist(api.addPackage(studentId, count))
    showToast(`${student.name} 已購買 ${count} 堂課`, {
      label: '復原',
      run: () => {
        writePackage(studentId, student.total, student.remaining)
        setToast(null)
      },
    })
  }

  const writePackage = (studentId, total, remaining) => {
    setStudents((list) => list.map((s) => (s.id === studentId ? { ...s, total, remaining } : s)))
    persist(api.setPackage(studentId, total, remaining))
  }

  const setPackage = (studentId, total, remaining) => {
    const student = students.find((s) => s.id === studentId)
    writePackage(studentId, total, remaining)
    showToast(`已修改 ${student.name} 的堂數：剩 ${remaining} 堂 / 累計 ${total} 堂`)
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
        const created = await api.createStudent({ ...profile, program })
        setStudents((list) => [...list, created])
        showToast(`已新增學生 ${created.name}`)
        go({ tab: 'students', studentId: created.id })
      }
    } catch {
      showToast('學生資料儲存失敗，請再試一次')
    }
  }

  // 刪除學生：移到學生名單最下面的「已刪除」，資料都保留，提示訊息上可以直接復原
  const deleteStudent = async (studentId) => {
    const student = students.find((s) => s.id === studentId)
    try {
      const { deletedAt } = await api.deleteStudent(studentId)
      setStudents((list) => list.map((s) => (s.id === studentId ? { ...s, deletedAt } : s)))
      go({ tab: 'students' })
      showToast(`已刪除學生 ${student.name}`, { label: '復原', run: () => restoreStudent(studentId) })
    } catch {
      showToast('刪除失敗，請再試一次')
    }
  }

  const restoreStudent = (studentId) => {
    const student = students.find((s) => s.id === studentId)
    if (!student) return // 已經永久刪除了
    setStudents((list) => list.map((s) => (s.id === studentId ? { ...s, deletedAt: null } : s)))
    showToast(`已復原學生 ${student.name}`)
    persist(api.restoreStudent(studentId))
  }

  // 永久刪除：連同訓練紀錄與排課一起刪掉，無法復原，等後端刪完才更新畫面
  const purgeStudent = async (studentId) => {
    const student = students.find((s) => s.id === studentId)
    try {
      await api.purgeStudent(studentId)
      setStudents((list) => list.filter((s) => s.id !== studentId))
      setBookings((list) => list.filter((b) => b.studentId !== studentId))
      showToast(`已永久刪除 ${student.name} 的所有資料`)
    } catch {
      showToast('永久刪除失敗，請再試一次')
    }
  }

  const importDemo = async () => {
    setImporting(true)
    try {
      const data = await api.importDemo()
      setStudents(data.students)
      setBookings(data.bookings)
      setExercises(data.exercises)
      showToast(`已匯入 ${data.students.length} 位示範學生（健身與皮拉提斯）`)
    } catch {
      showToast('匯入失敗，請再試一次')
    } finally {
      setImporting(false)
    }
  }

  // 排課時扣 1 堂（後端會再檢查一次剩餘堂數）
  const addBooking = async (booking) => {
    const student = students.find((s) => s.id === booking.studentId)
    if (student.remaining <= 0) {
      showToast(`${student.name} 沒有剩餘堂數，請先購買堂數`)
      return
    }
    try {
      const created = await api.addBooking(booking)
      const remaining = student.remaining - 1
      setBookings((list) => [...list, created])
      setStudents((list) => list.map((s) => (s.id === student.id ? { ...s, remaining } : s)))
      showToast(`已為 ${student.name} 排課：${booking.date.slice(5).replace('-', '/')} ${booking.time}，扣 1 堂（剩 ${remaining} 堂）`)
    } catch {
      showToast('排課失敗，請再試一次')
    }
  }

  // 取消排課：退回排課時扣的 1 堂。後端回傳退回後的堂數（舊規則排的課不退）；示範模式沒有後端，直接加 1
  const cancelBooking = async (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId)
    const student = students.find((s) => s.id === booking.studentId)
    try {
      const result = await api.deleteBooking(bookingId)
      const remaining = result?.remaining ?? student.remaining + 1
      setBookings((list) => list.filter((b) => b.id !== bookingId))
      setStudents((list) => list.map((s) => (s.id === student.id ? { ...s, remaining } : s)))
      go({ tab: route.tab })
      const refunded = remaining > student.remaining ? `，退回 1 堂（剩 ${remaining} 堂）` : ''
      showToast(`已取消 ${student.name} ${booking.date.slice(5).replace('-', '/')} ${booking.time} 的課${refunded}`)
    } catch {
      showToast('取消失敗，請再試一次')
    }
  }

  const moveBooking = (bookingId, date) => {
    const booking = bookings.find((b) => b.id === bookingId)
    const student = students.find((s) => s.id === booking.studentId)
    // 只和同一間教室的課比較：健身和皮拉提斯同一個時間不算重疊
    const clash = activeBookings.find((b) => b.id !== bookingId && b.date === date && b.time === booking.time)
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

  // 教練的動作清單（健身與皮拉提斯各一份）：新增自訂動作或移除不用的動作，畫面先更新再存檔
  const saveExercises = (list) => {
    setExercises((all) => ({ ...all, [program]: list }))
    persist(api.saveExercises(program, list))
  }

  let page
  if (route.form) {
    page = (
      <StudentForm
        key={route.form + (route.studentId ?? '')}
        student={route.form === 'edit' ? current : null}
        plans={config.plans}
        onCancel={() => go(route.form === 'edit' ? { tab: route.tab, studentId: route.studentId } : { tab: route.tab })}
        onSave={saveStudent}
        onDelete={route.form === 'edit' ? () => deleteStudent(route.studentId) : null}
      />
    )
  } else if (current && route.log) {
    const Log = program === 'pilates' ? PilatesLogSession : LogSession
    page = (
      <Log
        key={current.id}
        student={current}
        booking={bookings.find((b) => b.id === route.bookingId)}
        library={library}
        onLibraryChange={saveExercises}
        onCancel={() => go({ tab: route.tab, studentId: current.id })}
        onSave={(session) => saveSession(current.id, session, route.bookingId)}
        onCancelBooking={route.bookingId ? () => cancelBooking(route.bookingId) : null}
      />
    )
  } else if (current) {
    page = (
      <StudentDetail
        key={current.id}
        student={current}
        bookings={activeBookings}
        onBack={() => go({ tab: route.tab })}
        onLog={() => startLog(current.id)}
        onEdit={() => go({ tab: route.tab, studentId: current.id, form: 'edit' })}
        onAddPackage={(n) => addPackage(current.id, n)}
        onSetPackage={(total, remaining) => setPackage(current.id, total, remaining)}
        library={library}
        pilates={program === 'pilates'}
        onSavePr={(pr) => savePr(current.id, pr)}
      />
    )
  } else if (programStudents.length === 0) {
    page = (
      <Welcome
        label={config.label}
        // 匯入示範資料只能在資料庫完全沒有學生時使用
        canImport={!api.demo && students.length === 0}
        importing={importing}
        onCreate={() => go({ tab: 'students', form: 'new' })}
        onImport={importDemo}
      />
    )
  } else if (route.tab === 'students') {
    page = (
      <Students
        students={activeStudents}
        deleted={deletedStudents}
        onOpen={openStudent}
        onCreate={() => go({ tab: 'students', form: 'new' })}
        onRestore={restoreStudent}
        onPurge={purgeStudent}
      />
    )
  } else if (route.tab === 'schedule') {
    page = (
      <Schedule
        key={program}
        students={activeStudents}
        bookings={activeBookings}
        plans={config.plans}
        onOpen={openStudent}
        onLog={startLog}
        onAddBooking={addBooking}
        onMoveBooking={moveBooking}
      />
    )
  } else {
    page = (
      <Dashboard
        students={activeStudents}
        bookings={activeBookings}
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
        <ProgramSwitch program={program} onChange={switchProgram} />
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
          <ProgramSwitch program={program} onChange={switchProgram} />
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

// 健身／皮拉提斯切換：電腦版在上方導覽列，手機版在畫面最上面
function ProgramSwitch({ program, onChange }) {
  return (
    <div className="program-switch" role="radiogroup" aria-label="課程類別">
      {Object.values(PROGRAMS).map((p) => (
        <button
          key={p.id}
          type="button"
          role="radio"
          aria-checked={program === p.id}
          className={program === p.id ? 'active' : ''}
          onClick={() => program !== p.id && onChange(p.id)}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

// 目前的帳號：示範模式提醒資料不會儲存（示範登入時可以登出）；登入後顯示 Email 與登出
function Account({ demo, user, onLogout }) {
  if (demo) {
    return (
      <span className="account">
        <span className="demo-badge">示範模式・資料不會儲存</span>
        {onLogout && (
          <button className="text-btn" onClick={onLogout}>
            登出
          </button>
        )}
      </span>
    )
  }
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

// 這個類別還沒有學生時：新增第一位學生；整個資料庫都沒有學生時，也可以匯入 coachlog 的示範資料
function Welcome({ label, canImport, importing, onCreate, onImport }) {
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>歡迎使用{label}教練後台</h1>
        </div>
      </header>
      <section className="block welcome">
        <p>{label}還沒有任何學生。新增第一位學生後，就可以開始排課、記錄訓練。</p>
        <div className="btn-row">
          <button className="btn btn-ink btn-lg" onClick={onCreate}>
            新增學生
          </button>
          {canImport && (
            <button className="btn btn-line btn-lg" onClick={onImport} disabled={importing}>
              {importing ? '匯入中…' : '匯入示範資料'}
            </button>
          )}
        </div>
        {canImport && <p className="muted">示範資料包含健身 8 位、皮拉提斯 3 位學生，以及訓練紀錄與兩週的排課，方便先試用各項功能。</p>}
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
