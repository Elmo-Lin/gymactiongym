import { trainingGoals } from '../../data/classes'

function Field({ id, label, error, required, children, hint }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="field__req">*</span>}
      </label>
      {children}
      {error ? (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="field__hint">{hint}</p>
      )}
    </div>
  )
}

export default function InfoStep({ form, onChange, errors, touched, onBlur, partnerCount }) {
  const show = (key) => (touched[key] ? errors[key] : undefined)
  const set = (key) => (e) => onChange({ [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const setPartner = (i) => (e) => {
    const partners = [...form.partners]
    partners[i] = e.target.value
    onChange({ partners })
  }
  const inputProps = (key) => ({
    id: key,
    name: key,
    onBlur: () => onBlur(key),
    'aria-invalid': Boolean(show(key)),
    'aria-describedby': show(key) ? `${key}-error` : undefined,
  })

  return (
    <div className="step-panel">
      <h2 className="step-panel__title">填寫聯絡資料</h2>
      <p className="step-panel__lead">
        {partnerCount > 0
          ? `請填寫聯絡人資料，以及另外 ${partnerCount} 位同行朋友的姓名。`
          : '教練會在 24 小時內透過電話或 LINE 與你確認課程。'}
      </p>

      <div className="form-grid">
        <Field id="name" label="姓名" required error={show('name')}>
          <input type="text" autoComplete="name" placeholder="王小明" value={form.name} onChange={set('name')} {...inputProps('name')} />
        </Field>
        <Field id="phone" label="手機號碼" required error={show('phone')}>
          <input type="tel" autoComplete="tel" inputMode="tel" placeholder="0912-345-678" value={form.phone} onChange={set('phone')} {...inputProps('phone')} />
        </Field>
        <Field id="email" label="Email" required error={show('email')} hint="預約確認信將寄到這個信箱">
          <input type="email" autoComplete="email" placeholder="name@example.com" value={form.email} onChange={set('email')} {...inputProps('email')} />
        </Field>
        <Field id="goal" label="主要訓練目標" required error={show('goal')}>
          <select value={form.goal} onChange={set('goal')} {...inputProps('goal')}>
            <option value="">請選擇</option>
            {trainingGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>

        {Array.from({ length: partnerCount }, (_, i) => (
          <Field key={i} id={`partner${i}`} label={`同行學員 ${i + 1} 姓名`} required error={show(`partner${i}`)}>
            <input type="text" placeholder="同行學員姓名" value={form.partners[i] ?? ''} onChange={setPartner(i)} {...inputProps(`partner${i}`)} />
          </Field>
        ))}

        <Field id="experience" label="重量訓練經驗">
          <select id="experience" value={form.experience} onChange={set('experience')}>
            <option value="none">沒有經驗</option>
            <option value="some">一年以內</option>
            <option value="regular">一年以上</option>
          </select>
        </Field>

        <div className="form-grid__full">
          <Field id="note" label="備註" hint="例如：舊傷、身體狀況、想加強的部位">
            <textarea id="note" rows={3} maxLength={500} value={form.note} onChange={set('note')} placeholder="有什麼想先讓教練知道的嗎？" />
          </Field>
        </div>

        <div className="form-grid__full">
          <label className={`checkbox ${show('agree') ? 'checkbox--error' : ''}`}>
            <input type="checkbox" checked={form.agree} onChange={set('agree')} onBlur={() => onBlur('agree')} />
            <span>
              我已閱讀並同意預約須知：課程開始前 24 小時內取消或未到，將視同上課一堂；如身體有特殊狀況，會事先告知教練。
            </span>
          </label>
          {show('agree') && (
            <p className="field__error" role="alert">
              {errors.agree}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
