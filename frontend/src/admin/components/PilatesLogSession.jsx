import { useState } from 'react'
import { APPARATUS, PILATES_PLANS, TODAY, apparatusFor } from '../data.js'
import { lastRecord, shortDate } from '../utils.js'
import { ExercisePicker, Stepper } from './LogSession.jsx'
import { Icon, Remaining } from './ui.jsx'

// 預設帶入學生上次做這個動作的器械、彈簧與次數；第一次做的動作帶入常用的器械、兩組各 10 下
function prefill(student, name) {
  const last = lastRecord(student, name)
  return {
    name,
    apparatus: last?.apparatus ?? apparatusFor(name),
    spring: last?.spring ?? '',
    sets: last ? last.sets.map((s) => ({ reps: s.reps })) : [{ reps: 10 }, { reps: 10 }],
  }
}

function defaultPlan(student, booking) {
  if (booking && PILATES_PLANS[booking.plan]) return booking.plan
  const lastPlan = student.history[student.history.length - 1]?.plan
  const idx = student.plans.indexOf(lastPlan)
  return student.plans[(idx + 1) % student.plans.length] ?? Object.keys(PILATES_PLANS)[0]
}

// 記錄皮拉提斯的課：每個動作記器械、彈簧與每組次數（不記重量與 PR）。
// 畫面與流程和健身的 LogSession 相同：選課程主題 → 帶入上次的內容 → 微調 → 儲存。
// onCancelBooking：從排的課點進來時才有，用來取消這堂課（退回 1 堂）
export default function PilatesLogSession({ student, booking, library, onLibraryChange, onCancel, onSave, onCancelBooking }) {
  const [plan, setPlan] = useState(() => defaultPlan(student, booking))
  // 從排的課點進來就記在那堂課的日期，否則記在今天
  const date = booking?.date ?? TODAY
  const [exercises, setExercises] = useState(() => PILATES_PLANS[plan].map((n) => prefill(student, n)))
  const [note, setNote] = useState('')
  const [adding, setAdding] = useState('')
  const [saving, setSaving] = useState(false)
  // 取消課程要按兩次：第一次按下變成「確定取消？」，避免誤觸
  const [confirmCancel, setConfirmCancel] = useState(false)

  const changePlan = (p) => {
    setPlan(p)
    setExercises(PILATES_PLANS[p].map((n) => prefill(student, n)))
  }

  const updateExercise = (ei, patch) => setExercises((list) => list.map((e, i) => (i === ei ? { ...e, ...patch } : e)))

  const updateReps = (ei, si, reps) =>
    setExercises((list) =>
      list.map((e, i) => (i !== ei ? e : { ...e, sets: e.sets.map((s, j) => (j === si ? { reps } : s)) })),
    )

  const addSet = (ei) =>
    setExercises((list) =>
      list.map((e, i) => (i !== ei ? e : { ...e, sets: [...e.sets, { ...(e.sets[e.sets.length - 1] ?? { reps: 10 }) }] })),
    )

  const removeSet = (ei, si) =>
    setExercises((list) => list.map((e, i) => (i !== ei ? e : { ...e, sets: e.sets.filter((_, j) => j !== si) })))

  const removeExercise = (ei) => setExercises((list) => list.filter((_, i) => i !== ei))

  const addExercise = (name) => {
    if (!name) return
    setExercises((list) => [...list, prefill(student, name)])
    setAdding('')
  }

  // 存檔需要時間（送到後端），期間停用按鈕避免連按存成兩筆；成功後會離開這個畫面
  const save = async () => {
    if (saving) return
    setSaving(true)
    await onSave({
      id: `${student.id}-${Date.now()}`,
      date,
      plan,
      // 和健身的紀錄用同一個格式：每組的 weight 固定為 0，另外記器械與彈簧
      exercises: exercises
        .map((e) => ({
          name: e.name,
          apparatus: e.apparatus,
          spring: e.spring.trim() || null,
          sets: e.sets.filter((s) => s.reps > 0).map((s) => ({ weight: 0, reps: s.reps })),
        }))
        .filter((e) => e.sets.length > 0),
      note: note.trim(),
    })
    setSaving(false)
  }

  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0)
  const available = library.filter((n) => !exercises.some((e) => e.name === n))

  return (
    <div className="page log-page">
      <header className="log-head">
        <button className="icon-btn" onClick={onCancel} aria-label="取消">
          <Icon name="x" />
        </button>
        <div className="log-title">
          <h1>{student.name}</h1>
          <p className="muted">
            <span className="num">
              {shortDate(date)} {booking ? booking.time : ''}
            </span>{' '}
            · <Remaining remaining={student.remaining} />
          </p>
        </div>
        {onCancelBooking && (
          <button
            className="text-btn danger cancel-booking"
            onClick={() => (confirmCancel ? onCancelBooking() : setConfirmCancel(true))}
            onBlur={() => setConfirmCancel(false)}
          >
            {confirmCancel ? '確定取消？退回 1 堂' : '取消這堂課'}
          </button>
        )}
      </header>

      <div className="tabs">
        {Object.keys(PILATES_PLANS).map((p) => (
          <button key={p} className={plan === p ? 'active' : ''} onClick={() => changePlan(p)}>
            {p}
          </button>
        ))}
      </div>

      <p className="prefill-note">已帶入上次的器械、彈簧與次數，有變動再改就好。</p>

      <div className="ex-list">
        {exercises.map((e, ei) => {
          const last = lastRecord(student, e.name)
          return (
            <section className="ex" key={e.name}>
              <div className="ex-head">
                <h3>{e.name}</h3>
                {last ? <span className="ex-last num">上次 {shortDate(last.date)}</span> : <span className="cmp">新動作</span>}
              </div>

              <div className="ex-gear">
                <label>
                  <span>器械</span>
                  <select value={e.apparatus} onChange={(ev) => updateExercise(ei, { apparatus: ev.target.value })}>
                    {APPARATUS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>彈簧</span>
                  <input
                    value={e.spring}
                    maxLength={30}
                    placeholder={e.apparatus === '墊上' ? '墊上不用填' : '例如 2紅1藍'}
                    onChange={(ev) => updateExercise(ei, { spring: ev.target.value })}
                  />
                </label>
              </div>

              <div className="set-grid pilates">
                <span className="set-label">組</span>
                <span className="set-label set-prev-label">上次</span>
                <span className="set-label center">次</span>
                <span />
                {e.sets.map((s, si) => (
                  <div className="set-row" key={si}>
                    <span className="set-no num">{si + 1}</span>
                    <span className="set-prev num">{last?.sets[si] ? `${last.sets[si].reps} 下` : '—'}</span>
                    <Stepper label={`第 ${si + 1} 組次數`} value={s.reps} step={1} onChange={(v) => updateReps(ei, si, v)} />
                    <button className="icon-btn subtle" aria-label={`刪除第 ${si + 1} 組`} onClick={() => removeSet(ei, si)}>
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="ex-actions">
                <button className="text-btn" onClick={() => addSet(ei)}>
                  + 加一組
                </button>
                <button className="text-btn quiet" onClick={() => removeExercise(ei)}>
                  移除
                </button>
              </div>
            </section>
          )
        })}
      </div>

      <ExercisePicker
        library={library}
        available={available}
        adding={adding}
        onPick={addExercise}
        onCreate={(name) => {
          if (!library.includes(name)) onLibraryChange([...library, name])
          if (!exercises.some((e) => e.name === name)) addExercise(name)
        }}
        onRemove={(name) => onLibraryChange(library.filter((n) => n !== name))}
      />

      <label className="note-field">
        <span>備註</span>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Footwork 骨盆還會晃，下次先加強核心穩定"
        />
      </label>

      <div className="save-bar">
        <span className="num save-count">
          {exercises.length} 動作 · {totalSets} 組
        </span>
        <button className="btn btn-accent btn-lg" onClick={save} disabled={!totalSets || saving}>
          {saving ? '儲存中…' : '儲存'}
        </button>
      </div>
    </div>
  )
}
