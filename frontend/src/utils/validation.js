const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^09\d{8}$/

export const normalizePhone = (v) => v.replace(/[\s-]/g, '')

export function validateInfo(form, partnerCount) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = '請輸入姓名（至少 2 個字）'
  if (!EMAIL_RE.test(form.email.trim())) errors.email = '請輸入有效的 Email'
  if (!PHONE_RE.test(normalizePhone(form.phone))) errors.phone = '請輸入 09 開頭的 10 碼手機號碼'
  for (let i = 0; i < partnerCount; i++) {
    if (!(form.partners[i] ?? '').trim()) errors[`partner${i}`] = '請輸入同行學員姓名'
  }
  if (!form.goal) errors.goal = '請選擇主要訓練目標'
  if (!form.agree) errors.agree = '請閱讀並同意預約須知'
  return errors
}
