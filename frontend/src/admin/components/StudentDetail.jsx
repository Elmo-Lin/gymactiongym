import { useState } from 'react'
import { TODAY } from '../data.js'
import { formatWeight, percentOf, relativeDate, shortDate, topSet, weekday } from '../utils.js'
import PrBlock from './PrBlock.jsx'
import ProgressChart from './ProgressChart.jsx'
import { Icon, Remaining } from './ui.jsx'

export default function StudentDetail({ student, bookings, library, onBack, onLog, onEdit, onAddPackage, onSavePr }) {
  const counts = {}
  student.history.forEach((s) => s.exercises.forEach((e) => (counts[e.name] = (counts[e.name] || 0) + 1)))
  const exerciseNames = Object.keys(counts).sort((a, b) => counts[b] - counts[a])

  const [exercise, setExercise] = useState(exerciseNames[0])
  const [showTable, setShowTable] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const points = student.history
    .map((session) => {
      const ex = session.exercises.find((e) => e.name === exercise)
      return ex && { date: session.date, ...topSet(ex.sets) }
    })
    .filter(Boolean)
  const first = points[0]
  const latest = points[points.length - 1]
  const gain = first && latest ? latest.weight - first.weight : 0
  const gainPct = first && first.weight ? Math.round((gain / first.weight) * 100) : 0

  const used = student.total - student.remaining
  const upcoming = bookings
    .filter((b) => b.studentId === student.id && b.date >= TODAY && !b.done)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const history = [...student.history].reverse()
  const visibleHistory = showAll ? history : history.slice(0, 4)

  return (
    <div className="page">
      <button className="back" onClick={onBack}>
        <Icon name="back" size={18} /> 學生
      </button>

      <header className="page-head profile">
        <div>
          <h1>{student.name}</h1>
          <p className="profile-meta">
            {[student.gender, student.age && `${student.age} 歲`, student.goal].filter(Boolean).join(' · ')}
            {student.phone && (
              <>
                {' · '}
                <span className="num">{student.phone}</span>
              </>
            )}
            <button className="text-btn profile-edit" onClick={onEdit}>
              <Icon name="edit" size={16} /> 編輯
            </button>
          </p>
        </div>
        <button className="btn btn-ink btn-lg" onClick={onLog}>
          記錄今天的訓練
        </button>
      </header>

      {student.note && (
        <p className="caution">
          <b>注意</b>
          {student.note}
        </p>
      )}

      <div className="cols cols-wide">
        <section className="block">
          <div className="block-head">
            <h2>進步</h2>
            <button className="text-btn" onClick={() => setShowTable((v) => !v)}>
              {showTable ? '圖表' : '表格'}
            </button>
          </div>
          <div className="tabs tabs-scroll">
            {exerciseNames.map((name) => (
              <button
                key={name}
                className={exercise === name ? 'active' : ''}
                onClick={() => setExercise(name)}
              >
                {name}
              </button>
            ))}
          </div>
          {latest && (
            <div className="figure">
              <span className="figure-value num">{formatWeight(latest.weight)}</span>
              <span className="figure-unit">
                kg × <span className="num">{latest.reps}</span>
              </span>
              {gain > 0 && (
                <span className="figure-delta num">
                  +{formatWeight(gain)} kg / +{gainPct}%<small> 自 {shortDate(first.date)}</small>
                </span>
              )}
            </div>
          )}
          {showTable ? (
            <table className="mini-table">
              <tbody>
                {[...points].reverse().map((p) => (
                  <tr key={p.date}>
                    <td className="num">{shortDate(p.date)}</td>
                    <td className="num right">
                      {formatWeight(p.weight)} × {p.reps}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <ProgressChart key={exercise} points={points} />
          )}
        </section>

        <div className="stack">
          <section className="block">
            <div className="block-head">
              <h2>堂數</h2>
              <Remaining remaining={student.remaining} />
            </div>
            <div className="package">
              <span className="package-big num">{student.remaining}</span>
              <span className="package-of num">/ {student.total}</span>
              <span className="muted package-used">已上 {used} 堂</span>
            </div>
            <div className="ticks ticks-lg" style={{ '--n': student.total }} aria-label={`已上 ${used} / ${student.total} 堂`}>
              {Array.from({ length: student.total }, (_, i) => (
                <i key={i} className={i < used ? 'on' : ''} />
              ))}
            </div>
            <div className="btn-row">
              <button className="btn btn-line" onClick={() => onAddPackage(10)}>
                +10 堂
              </button>
              <button className="btn btn-line" onClick={() => onAddPackage(20)}>
                +20 堂
              </button>
            </div>
          </section>

          <PrBlock student={student} library={library} onSave={onSavePr} />

          <section className="block">
            <div className="block-head">
              <h2>接下來</h2>
            </div>
            {upcoming.length === 0 ? (
              <p className="empty">尚未排課</p>
            ) : (
              <ul className="rows compact">
                {upcoming.map((b) => (
                  <li key={b.id}>
                    <span className="num upcoming-when">
                      {b.date === TODAY ? '今天' : `${shortDate(b.date)} 週${weekday(b.date)}`} {b.time}
                    </span>
                    <span className="muted">{b.plan}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <section className="block">
        <div className="block-head">
          <h2>紀錄</h2>
          <span className="num">{student.history.length} 次</span>
        </div>
        {history.length === 0 && <p className="empty">還沒有訓練紀錄，按「記錄今天的訓練」開始第一筆。</p>}
        <ul className="log">
          {visibleHistory.map((session) => (
            <li key={session.id}>
              <div className="log-date">
                <span className="num">{shortDate(session.date)}</span>
                <small>
                  週{weekday(session.date)} · {relativeDate(session.date)}
                </small>
              </div>
              <div className="log-body">
                <p className="log-plan">{session.plan}</p>
                <dl className="log-ex">
                  {session.exercises.map((e) => {
                    const best = topSet(e.sets)
                    return (
                      <div key={e.name}>
                        <dt>{e.name}</dt>
                        <dd className="num">
                          {e.pr > 0 && <small className="pct">{best.pct ?? percentOf(best.weight, e.pr)}% </small>}
                          {formatWeight(best.weight)} × {best.reps}
                          <small> ×{e.sets.length}組</small>
                        </dd>
                      </div>
                    )
                  })}
                </dl>
                {session.note && <p className="log-note">「{session.note}」</p>}
              </div>
            </li>
          ))}
        </ul>
        {history.length > 4 && (
          <button className="text-btn more" onClick={() => setShowAll((v) => !v)}>
            {showAll ? '收合' : `看全部 ${history.length} 次`}
          </button>
        )}
      </section>
    </div>
  )
}
