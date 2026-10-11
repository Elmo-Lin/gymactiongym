import { useState } from 'react'
import { EXERCISES, PLANS, TODAY } from '../data.js'
import { formatWeight, lastRecord, shortDate, topSet } from '../utils.js'
import { Icon, Remaining } from './ui.jsx'

const LIGHT = ['弓箭步', '二頭彎舉']
const stepFor = (name) => (LIGHT.includes(name) ? 1 : 2.5)

// 預設帶入學生上次做這個動作的重量與次數，教練只需微調
function prefill(student, name) {
  const last = lastRecord(student, name)
  const sets = last ? last.sets.map((s) => ({ ...s })) : [1, 2, 3].map(() => ({ weight: 20, reps: 10 }))
  return { name, sets }
}

function defaultPlan(student, booking) {
  if (booking) return booking.plan
  const lastPlan = student.history[student.history.length - 1]?.plan
  const idx = student.plans.indexOf(lastPlan)
  return student.plans[(idx + 1) % student.plans.length]
}

function Stepper({ value, step, onChange, label }) {
  return (
    <div className="stepper">
      <button type="button" aria-label={`${label}減少`} onClick={() => onChange(Math.max(0, value - step))}>
        <Icon name="minus" size={16} />
      </button>
      <input
        className="num"
        type="number"
        inputMode="decimal"
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      />
      <button type="button" aria-label={`${label}增加`} onClick={() => onChange(value + step)}>
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}

function Compare({ sets, last }) {
  if (!last) return <span className="cmp">新動作</span>
  if (!sets.length) return null
  const now = topSet(sets)
  const before = topSet(last.sets)
  if (now.weight > before.weight)
    return <span className="cmp cmp-up num">+{formatWeight(now.weight - before.weight)} kg</span>
  if (now.weight === before.weight && now.reps > before.reps)
    return <span className="cmp cmp-up num">+{now.reps - before.reps} 下</span>
  if (now.weight < before.weight || now.reps < before.reps)
    return <span className="cmp">減量</span>
  return <span className="cmp">同上次</span>
}

export default function LogSession({ student, booking, onCancel, onSave }) {
  const [plan, setPlan] = useState(() => defaultPlan(student, booking))
  const [exercises, setExercises] = useState(() => PLANS[plan].map((n) => prefill(student, n)))
  const [note, setNote] = useState('')
  const [adding, setAdding] = useState('')
  const [saving, setSaving] = useState(false)

  const changePlan = (p) => {
    setPlan(p)
    setExercises(PLANS[p].map((n) => prefill(student, n)))
  }

  const updateSet = (ei, si, field, value) =>
    setExercises((list) =>
      list.map((e, i) =>
        i !== ei ? e : { ...e, sets: e.sets.map((s, j) => (j === si ? { ...s, [field]: value } : s)) },
      ),
    )

  const addSet = (ei) =>
    setExercises((list) =>
      list.map((e, i) => (i !== ei ? e : { ...e, sets: [...e.sets, { ...e.sets[e.sets.length - 1] }] })),
    )

  const removeSet = (ei, si) =>
    setExercises((list) =>
      list.map((e, i) => (i !== ei ? e : { ...e, sets: e.sets.filter((_, j) => j !== si) })),
    )

  const bumpAll = (ei) =>
    setExercises((list) =>
      list.map((e, i) =>
        i !== ei ? e : { ...e, sets: e.sets.map((s) => ({ ...s, weight: s.weight + stepFor(e.name) })) },
      ),
    )

  const removeExercise = (ei) => setExercises((list) => list.filter((_, i) => i !== ei))

  const addExercise = (name) => {
    if (!name) return
    setExercises((list) => [...list, prefill(student, name)])
    setAdding('')
  }

  // 存檔需要時間（送到後端），期間停用按鈕避免連按扣兩堂；成功後會離開這個畫面
  const save = async () => {
    if (saving) return
    setSaving(true)
    await onSave({
      id: `${student.id}-${Date.now()}`,
      date: TODAY,
      plan,
      exercises: exercises
        .map((e) => ({ ...e, sets: e.sets.filter((s) => s.reps > 0) }))
        .filter((e) => e.sets.length > 0),
      note: note.trim(),
    })
    setSaving(false)
  }

  const totalSets = exercises.reduce((n, e) => n + e.sets.length, 0)
  const available = EXERCISES.filter((n) => !exercises.some((e) => e.name === n))

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
              {shortDate(TODAY)} {booking ? booking.time : ''}
            </span>{' '}
            · <Remaining remaining={student.remaining} />
          </p>
        </div>
      </header>

      <div className="tabs">
        {Object.keys(PLANS).map((p) => (
          <button key={p} className={plan === p ? 'active' : ''} onClick={() => changePlan(p)}>
            {p}
          </button>
        ))}
      </div>

      <p className="prefill-note">已帶入上次的數字，有變動再改就好。</p>

      <div className="ex-list">
        {exercises.map((e, ei) => {
          const last = lastRecord(student, e.name)
          return (
            <section className="ex" key={e.name}>
              <div className="ex-head">
                <h3>{e.name}</h3>
                <Compare sets={e.sets} last={last} />
                {last && <span className="ex-last num">上次 {shortDate(last.date)}</span>}
              </div>

              <div className="set-grid">
                <span className="set-label">組</span>
                <span className="set-label">上次</span>
                <span className="set-label center">kg</span>
                <span className="set-label center">次</span>
                <span />
                {e.sets.map((s, si) => {
                  const prev = last?.sets[si]
                  return (
                    <div className="set-row" key={si}>
                      <span className="set-no num">{si + 1}</span>
                      <span className="set-prev num">
                        {prev ? `${formatWeight(prev.weight)}×${prev.reps}` : '—'}
                      </span>
                      <Stepper
                        label={`第 ${si + 1} 組重量`}
                        value={s.weight}
                        step={stepFor(e.name)}
                        onChange={(v) => updateSet(ei, si, 'weight', v)}
                      />
                      <Stepper
                        label={`第 ${si + 1} 組次數`}
                        value={s.reps}
                        step={1}
                        onChange={(v) => updateSet(ei, si, 'reps', v)}
                      />
                      <button
                        className="icon-btn subtle"
                        aria-label={`刪除第 ${si + 1} 組`}
                        onClick={() => removeSet(ei, si)}
                      >
                        <Icon name="x" size={16} />
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="ex-actions">
                <button className="text-btn" onClick={() => addSet(ei)} disabled={!e.sets.length}>
                  + 加一組
                </button>
                <button className="text-btn" onClick={() => bumpAll(ei)}>
                  全部 +{stepFor(e.name)} kg
                </button>
                <button className="text-btn quiet" onClick={() => removeExercise(ei)}>
                  移除
                </button>
              </div>
            </section>
          )
        })}
      </div>

      <select
        className="add-ex"
        value={adding}
        onChange={(e) => addExercise(e.target.value)}
        aria-label="新增動作"
      >
        <option value="">+ 新增動作</option>
        {available.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <label className="note-field">
        <span>備註</span>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="深蹲第三組膝蓋內夾，下次降重"
        />
      </label>

      <div className="save-bar">
        <span className="num save-count">
          {exercises.length} 動作 · {totalSets} 組
        </span>
        <button className="btn btn-accent btn-lg" onClick={save} disabled={!totalSets || saving}>
          {saving ? '儲存中…' : '儲存，扣 1 堂'}
        </button>
      </div>
    </div>
  )
}
