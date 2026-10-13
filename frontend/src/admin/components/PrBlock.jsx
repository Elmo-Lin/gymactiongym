import { useState } from 'react'
import { TODAY } from '../data.js'
import { formatWeight, latestPrs, shortDate } from '../utils.js'

// 常做 PR 測驗的主項，新增時排在選單最前面
const MAIN_LIFTS = ['深蹲', '臥推', '架上硬舉']

// 學生頁的 PR 區：列出每個動作最新的 PR，教練測完之後手動輸入。
// 有 PR 的動作，記錄訓練時就會顯示 % 按鈕
export default function PrBlock({ student, library, onSave }) {
  const prs = latestPrs(student)
  const [form, setForm] = useState(null) // { exercise, weight, date, fixed }

  const open = (exercise) => setForm({ exercise: exercise ?? '', weight: '', date: TODAY, fixed: Boolean(exercise) })
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const options = [
    ...new Set([...MAIN_LIFTS.filter((n) => library.includes(n)), ...prs.map((pr) => pr.exercise), ...library]),
  ]
  const weight = Number(form?.weight)
  const valid = form && form.exercise && weight > 0 && weight <= 1000 && form.date && form.date <= TODAY

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    onSave({ exercise: form.exercise, weight, date: form.date })
    setForm(null)
  }

  return (
    <section className="block">
      <div className="block-head">
        <h2>PR</h2>
        {!form && (
          <button className="text-btn" onClick={() => open()}>
            + 新增
          </button>
        )}
      </div>

      {prs.length === 0 && !form && (
        <p className="empty">還沒有 PR。輸入深蹲、臥推等主項的測驗結果，記錄訓練時就能用 % 算重量。</p>
      )}

      {prs.length > 0 && (
        <ul className="rows compact pr-list">
          {prs.map((pr) => {
            const diff = pr.previous ? pr.weight - pr.previous.weight : 0
            return (
              <li key={pr.exercise}>
                <span className="pr-name">{pr.exercise}</span>
                <span className="pr-value num">
                  {formatWeight(pr.weight)}
                  <small> kg</small>
                </span>
                <span className="pr-meta num">
                  {shortDate(pr.date)}
                  {diff !== 0 && (
                    <b className={diff > 0 ? 'up' : ''}>
                      {diff > 0 ? '+' : '−'}
                      {formatWeight(Math.abs(diff))}
                    </b>
                  )}
                </span>
                <button className="text-btn" onClick={() => open(pr.exercise)}>
                  更新
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {form && (
        <form className="pr-form" onSubmit={submit}>
          <div className="form-grid">
            {form.fixed ? (
              <p className="pr-form-title">{form.exercise}</p>
            ) : (
              <label>
                動作
                <select value={form.exercise} onChange={set('exercise')} required>
                  <option value="">選擇動作</option>
                  {options.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              PR 重量（kg）
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max="1000"
                step="any"
                value={form.weight}
                onChange={set('weight')}
                autoFocus={form.fixed}
                required
              />
            </label>
            <label>
              測驗日期
              <input type="date" max={TODAY} value={form.date} onChange={set('date')} required />
            </label>
          </div>
          <p className="muted pr-form-hint">同一個動作同一天輸入兩次，會以後面那次為準。</p>
          <div className="btn-row">
            <button type="submit" className="btn btn-ink" disabled={!valid}>
              儲存
            </button>
            <button type="button" className="btn btn-line" onClick={() => setForm(null)}>
              取消
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
