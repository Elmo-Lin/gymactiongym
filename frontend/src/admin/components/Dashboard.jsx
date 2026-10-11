import { TODAY, addDays } from '../data.js'
import { parseISO, relativeDate, weekStart, weekday } from '../utils.js'
import { Icon, Remaining } from './ui.jsx'

export default function Dashboard({ students, bookings, onOpen, onLog, onAddPackage, onTab }) {
  const byId = Object.fromEntries(students.map((s) => [s.id, s]))
  const today = bookings
    .filter((b) => b.date === TODAY)
    .sort((a, b) => a.time.localeCompare(b.time))
  const monday = weekStart(TODAY)
  const sunday = addDays(monday, 6)
  const weekCount = bookings.filter((b) => b.date >= monday && b.date <= sunday).length
  const renew = students
    .filter((s) => s.remaining <= 3)
    .sort((a, b) => a.remaining - b.remaining)
  const todayLeft = today.filter((b) => !b.done).length
  const d = parseISO(TODAY)

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="dateline num">
            {String(d.getMonth() + 1).padStart(2, '0')}.{String(d.getDate()).padStart(2, '0')}
            <span>週{weekday(TODAY)}</span>
          </p>
          <h1>今天</h1>
        </div>
        <p className="head-note">
          {todayLeft > 0 ? (
            <>
              還有 <b className="num">{todayLeft}</b> 堂課
            </>
          ) : (
            '今天的課都上完了'
          )}
        </p>
      </header>

      <section className="scoreboard">
        <button onClick={() => onTab('students')}>
          <span className="num">{students.length}</span>
          <span>位學生</span>
        </button>
        <button onClick={() => onTab('schedule')}>
          <span className="num">{weekCount}</span>
          <span>本週堂數</span>
        </button>
        <div className={renew.length ? 'hot' : ''}>
          <span className="num">{renew.length}</span>
          <span>位待續課</span>
        </div>
      </section>

      <div className="cols">
        <section className="block">
          <div className="block-head">
            <h2>今日課表</h2>
            <span className="num">{today.length} 堂</span>
          </div>
          {today.length === 0 && <p className="empty">今天沒有排課</p>}
          <ul className="agenda">
            {today.map((b) => {
              const s = byId[b.studentId]
              return (
                <li key={b.id} className={b.done ? 'done' : ''}>
                  <span className="agenda-time num">{b.time}</span>
                  <button className="agenda-who" onClick={() => onOpen(s.id)}>
                    <strong>{s.name}</strong>
                    <span>
                      {b.plan} · <Remaining remaining={s.remaining} />
                    </span>
                  </button>
                  {b.done ? (
                    <span className="done-mark">
                      <Icon name="check" size={16} /> 已記錄
                    </span>
                  ) : (
                    <button className="btn btn-ink" onClick={() => onLog(s.id, b.id)}>
                      記錄
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="block">
          <div className="block-head">
            <h2>該續課了</h2>
            <span>剩 3 堂以下</span>
          </div>
          {renew.length === 0 && <p className="empty">目前沒有需要續課的學生</p>}
          <ul className="rows">
            {renew.map((s) => {
              const last = s.history[s.history.length - 1]
              return (
                <li key={s.id}>
                  <button className="rows-main" onClick={() => onOpen(s.id)}>
                    <strong>{s.name}</strong>
                    <span className="muted">{last ? `上次 ${relativeDate(last.date)}` : '尚未上課'}</span>
                  </button>
                  <Remaining remaining={s.remaining} />
                  <button className="btn btn-line" onClick={() => onAddPackage(s.id, 10)}>
                    +10 堂
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
