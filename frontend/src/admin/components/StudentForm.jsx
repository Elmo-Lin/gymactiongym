import { useState } from 'react'
import { PLANS } from '../data.js'
import { Icon } from './ui.jsx'

const GOALS = ['增肌', '減脂', '力量', '提升體能', '臀腿線條', '姿勢矯正', '產後恢復', '傷後回歸']
const EMPTY = { name: '', gender: '女', age: '', goal: '', plans: ['全身訓練'], phone: '', note: '' }

// 新增或編輯學生（coachlog 原本只有示範資料，沒有這個畫面）。堂數不在這裡改，由「購買堂數」與「記錄訓練」增減。
// 編輯時最下面可以刪除學生（onDelete），刪除的學生可以在學生名單最下面復原
export default function StudentForm({ student, onCancel, onSave, onDelete }) {
  const [form, setForm] = useState(() =>
    student
      ? {
          name: student.name,
          gender: student.gender,
          age: String(student.age ?? ''),
          goal: student.goal,
          plans: student.plans,
          phone: student.phone,
          note: student.note,
        }
      : EMPTY,
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const remove = async () => {
    setDeleting(true)
    await onDelete()
    setDeleting(false)
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const togglePlan = (plan) =>
    setForm((f) => ({
      ...f,
      plans: f.plans.includes(plan) ? f.plans.filter((p) => p !== plan) : [...f.plans, plan],
    }))

  const valid = form.name.trim() && form.plans.length > 0

  const submit = async (e) => {
    e.preventDefault()
    if (!valid || saving) return
    setSaving(true)
    await onSave({
      name: form.name.trim(),
      gender: form.gender,
      age: form.age ? Number(form.age) : null,
      goal: form.goal.trim(),
      // 依 PLANS 的順序排列，記錄訓練時會依序輪替
      plans: Object.keys(PLANS).filter((p) => form.plans.includes(p)),
      phone: form.phone.trim(),
      note: form.note.trim(),
    })
    setSaving(false)
  }

  return (
    <form className="page" onSubmit={submit}>
      <button type="button" className="back" onClick={onCancel}>
        <Icon name="back" size={18} /> {student ? student.name : '學生'}
      </button>

      <header className="page-head">
        <div>
          <h1>{student ? '編輯學生資料' : '新增學生'}</h1>
        </div>
      </header>

      <section className="block">
        <div className="form-grid">
          <label>
            姓名 *
            <input value={form.name} onChange={set('name')} required autoFocus={!student} />
          </label>
          <label>
            性別
            <select value={form.gender} onChange={set('gender')}>
              <option>女</option>
              <option>男</option>
            </select>
          </label>
          <label>
            年齡
            <input type="number" inputMode="numeric" min="1" max="120" value={form.age} onChange={set('age')} />
          </label>
          <label>
            手機
            <input type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} placeholder="0912-345-678" />
          </label>
          <label>
            目標
            <input value={form.goal} onChange={set('goal')} list="goal-options" placeholder="例如：增肌" />
            <datalist id="goal-options">
              {GOALS.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </label>
        </div>

        <p className="field-title">訓練內容 *（記錄訓練時會依序輪替）</p>
        <div className="tabs">
          {Object.keys(PLANS).map((p) => (
            <button
              key={p}
              type="button"
              className={form.plans.includes(p) ? 'active' : ''}
              aria-pressed={form.plans.includes(p)}
              onClick={() => togglePlan(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <label className="note-field">
          <span>注意事項</span>
          <textarea rows={3} value={form.note} onChange={set('note')} placeholder="舊傷、身體狀況，記錄訓練時會顯示提醒" />
        </label>
      </section>

      <div className="btn-row">
        <button type="submit" className="btn btn-ink btn-lg" disabled={!valid || saving}>
          {saving ? '儲存中…' : '儲存'}
        </button>
        <button type="button" className="btn btn-line btn-lg" onClick={onCancel}>
          取消
        </button>
      </div>

      {onDelete && (
        <section className="danger-zone">
          <button type="button" className="text-btn danger" onClick={remove} disabled={deleting}>
            {deleting ? '刪除中…' : '刪除這位學生'}
          </button>
          <p className="muted">刪除後會移到學生名單最下面的「已刪除」，訓練紀錄都會保留，隨時可以復原。</p>
        </section>
      )}
    </form>
  )
}
