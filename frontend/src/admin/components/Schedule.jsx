import { useState } from 'react'
import { PLANS, TODAY, addDays } from '../data.js'
import { parseISO, shortDate, weekStart, weekday } from '../utils.js'
import { Icon, Remaining } from './ui.jsx'
import useBookingDrag from './useBookingDrag.js'

function AddBooking({ students, date, onAdd, onClose }) {
  const [studentId, setStudentId] = useState(students[0].id)
  const [time, setTime] = useState('19:00')
  const [plan, setPlan] = useState(students[0].plans[0])
  const [day, setDay] = useState(date)

  const submit = (e) => {
    e.preventDefault()
    onAdd({ studentId, time, plan, date: day })
    onClose()
  }

  return (
    <form className="block add-booking" onSubmit={submit}>
      <div className="block-head">
        <h2>新增課程</h2>
        <button type="button" className="icon-btn subtle" onClick={onClose} aria-label="關閉">
          <Icon name="x" size={18} />
        </button>
      </div>
      <div className="form-grid">
        <label>
          學生
          <select
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value)
              setPlan(students.find((s) => s.id === e.target.value).plans[0])
            }}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}（剩 {s.remaining} 堂）
              </option>
            ))}
          </select>
        </label>
        <label>
          日期
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} required />
        </label>
        <label>
          時間
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </label>
        <label>
          課程內容
          <select value={plan} onChange={(e) => setPlan(e.target.value)}>
            {Object.keys(PLANS).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <button className="btn btn-ink" type="submit">
        確認排課
      </button>
    </form>
  )
}

// 已記錄的課不能移動；也不能改到今天以前
const canDrop = (booking, date) => !booking.done && date >= TODAY && date !== booking.date

export default function Schedule({ students, bookings, onOpen, onLog, onAddBooking, onMoveBooking }) {
  const [monday, setMonday] = useState(() => weekStart(TODAY))
  const [selected, setSelected] = useState(TODAY)
  const [adding, setAdding] = useState(false)
  const { drag, dragProps } = useBookingDrag({
    canDrop,
    onDrop: (booking, date) => onMoveBooking(booking.id, date),
  })

  // 拖曳中各個日期的狀態，用來標示可以／不能放
  const dropClass = (iso) => {
    if (!drag) return ''
    if (drag.over === iso) return 'drop-over'
    return canDrop(drag.booking, iso) ? 'drop-ok' : 'drop-no'
  }
  const draggable = (b) => (b.done ? {} : dragProps(b))
  const isDragging = (b) => drag?.booking.id === b.id

  const byId = Object.fromEntries(students.map((s) => [s.id, s]))
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const onDay = (iso) =>
    bookings.filter((b) => b.date === iso).sort((a, b) => a.time.localeCompare(b.time))
  const sunday = days[6]
  const weekTotal = bookings.filter((b) => b.date >= monday && b.date <= sunday).length

  const shiftWeek = (n) => {
    const next = addDays(monday, n * 7)
    setMonday(next)
    setSelected(next <= TODAY && TODAY <= addDays(next, 6) ? TODAY : next)
  }

  const goThisWeek = () => {
    setMonday(weekStart(TODAY))
    setSelected(TODAY)
  }

  const m = parseISO(monday)
  const selectedList = onDay(selected)

  return (
    <div className={`page ${drag ? 'is-dragging' : ''}`}>
      <header className="page-head">
        <div>
          <p className="dateline num">
            {shortDate(monday)} – {shortDate(sunday)}
            <span>{weekTotal} 堂</span>
          </p>
          <h1>
            {m.getMonth() + 1} 月
          </h1>
        </div>
        <div className="head-actions">
          <button className="icon-btn" onClick={() => shiftWeek(-1)} aria-label="上一週">
            <Icon name="back" />
          </button>
          <button className="text-btn" onClick={goThisWeek}>
            本週
          </button>
          <button className="icon-btn" onClick={() => shiftWeek(1)} aria-label="下一週">
            <Icon name="next" />
          </button>
          <button className="btn btn-ink" onClick={() => setAdding(true)}>
            + 排課
          </button>
        </div>
      </header>

      <p className="drag-hint">
        <span className="hint-wide">拖曳課程到其他天即可改期</span>
        <span className="hint-narrow">長按課程，拖到上方日期即可改期</span>
      </p>

      {adding && (
        <AddBooking
          students={students}
          date={selected}
          onAdd={onAddBooking}
          onClose={() => setAdding(false)}
        />
      )}

      {/* 手機：日期條 + 當日清單 */}
      <div className="day-strip">
        {days.map((iso) => {
          const count = onDay(iso).length
          return (
            <button
              key={iso}
              data-drop-date={iso}
              className={`day ${iso === selected ? 'active' : ''} ${iso === TODAY ? 'today' : ''} ${dropClass(iso)}`}
              onClick={() => setSelected(iso)}
            >
              <span className="day-w">{weekday(iso)}</span>
              <span className="day-d num">{parseISO(iso).getDate()}</span>
              <span className="day-count num">{count || ''}</span>
            </button>
          )
        })}
      </div>

      <section className="block day-list">
        <div className="block-head">
          <h2>
            {selected === TODAY ? '今天' : shortDate(selected)} 週{weekday(selected)}
          </h2>
          <span className="num">{selectedList.length} 堂</span>
        </div>
        {selectedList.length === 0 && <p className="empty">這天沒有排課</p>}
        <ul className="agenda">
          {selectedList.map((b) => {
            const s = byId[b.studentId]
            return (
              <li
                key={b.id}
                className={`${b.done ? 'done' : 'draggable'} ${isDragging(b) ? 'dragging' : ''}`}
                {...draggable(b)}
              >
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
                ) : b.date <= TODAY ? (
                  <button className="btn btn-ink" onClick={() => onLog(s.id, b.id)}>
                    記錄
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>

      {/* 桌機：整週格狀 */}
      <div className="week-grid">
        {days.map((iso) => (
          <div
            key={iso}
            data-drop-date={iso}
            className={`week-col ${iso === TODAY ? 'today' : ''} ${dropClass(iso)}`}
          >
            <button className="week-col-head" onClick={() => setSelected(iso)}>
              <span>{weekday(iso)}</span>
              <strong className="num">{parseISO(iso).getDate()}</strong>
            </button>
            {onDay(iso).map((b) => {
              const s = byId[b.studentId]
              return (
                <button
                  key={b.id}
                  className={`slot ${b.done ? 'done' : 'draggable'} ${isDragging(b) ? 'dragging' : ''}`}
                  onClick={() => (b.done || b.date > TODAY ? onOpen(s.id) : onLog(s.id, b.id))}
                  {...draggable(b)}
                >
                  <span className="slot-time num">{b.time}</span>
                  <strong>{s.name}</strong>
                  <span className="muted">{b.plan.replace('訓練', '')}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {drag && (
        <div
          className="drag-ghost"
          style={{ left: Math.min(Math.max(drag.x, 76), window.innerWidth - 76), top: drag.y }}
          aria-hidden="true"
        >
          <span className="num">{drag.booking.time}</span>
          <strong>{byId[drag.booking.studentId].name}</strong>
          <small>
            {drag.over ? `→ ${shortDate(drag.over)} 週${weekday(drag.over)}` : '拖到要改的日期'}
          </small>
        </div>
      )}
    </div>
  )
}
