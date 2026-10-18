import { useState } from 'react'
import { Remaining } from './ui.jsx'

// 學生頁的堂數區：剩餘／累計購買、購買堂數，以及按錯或記錯時直接修改堂數
export default function PackageBlock({ student, onAddPackage, onSetPackage }) {
  const [form, setForm] = useState(null) // { total, remaining }，修改中的數字（字串）
  const used = student.total - student.remaining

  const total = Number(form?.total)
  const remaining = Number(form?.remaining)
  const valid =
    form && form.total !== '' && form.remaining !== '' && Number.isInteger(total) && Number.isInteger(remaining) &&
    total >= 0 && remaining >= 0 && total <= 1000 && remaining <= total

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    onSetPackage(total, remaining)
    setForm(null)
  }

  return (
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

      {form ? (
        <form onSubmit={submit}>
          <div className="form-grid package-form">
            <label>
              累計購買（堂）
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="1000"
                value={form.total}
                onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
              />
            </label>
            <label>
              剩餘（堂）
              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={form.remaining}
                onChange={(e) => setForm((f) => ({ ...f, remaining: e.target.value }))}
              />
            </label>
          </div>
          <p className="muted package-hint">
            {valid ? `改完會是：已上 ${total - remaining} 堂、剩 ${remaining} 堂` : '剩餘堂數不能超過累計購買堂數'}
          </p>
          <div className="btn-row">
            <button type="submit" className="btn btn-ink" disabled={!valid}>
              儲存
            </button>
            <button type="button" className="btn btn-line" onClick={() => setForm(null)}>
              取消
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="btn-row">
            <button className="btn btn-line" onClick={() => onAddPackage(10)}>
              +10 堂
            </button>
            <button className="btn btn-line" onClick={() => onAddPackage(20)}>
              +20 堂
            </button>
          </div>
          <button
            className="text-btn quiet package-edit"
            onClick={() => setForm({ total: String(student.total), remaining: String(student.remaining) })}
          >
            修改堂數
          </button>
        </>
      )}
    </section>
  )
}
