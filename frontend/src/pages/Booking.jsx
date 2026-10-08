import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import BookingDetails from '../components/booking/BookingDetails'
import InfoStep from '../components/booking/InfoStep'
import PlanStep from '../components/booking/PlanStep'
import TimeStep from '../components/booking/TimeStep'
import Button from '../components/Button'
import Icon from '../components/Icon'
import StepIndicator from '../components/StepIndicator'
import { getPlan, weeklyPackages } from '../data/classes'
import { SESSION_MINUTES } from '../data/schedule'
import { SlotTakenError, submitBooking } from '../services/bookings'
import { BOOKING_RANGE_DAYS, useSlots } from '../services/slots'
import { BOOKING_STEPS, calcPrice, canBookSlot, formatPrice, getSlot, weeklyStartOptions } from '../utils/booking'
import { addDays, addMinutes, formatDate, isValidISODate, isValidTime, todayISO, WEEKDAY_LABELS, weekdayOf } from '../utils/date'
import { clearDraft, loadDraft, saveDraft } from '../utils/storage'
import { normalizePhone, validateInfo } from '../utils/validation'

const DRAFT_KEY = 'action-gym:booking-draft'
const DRAFT_VERSION = 1

const emptyForm = { name: '', email: '', phone: '', partners: ['', ''], goal: '', experience: 'none', note: '', agree: false }

const emptyState = {
  version: DRAFT_VERSION,
  step: 1,
  planId: null,
  mode: 'single',
  date: null,
  time: null,
  weekday: null,
  weeklyTime: null,
  startDate: null,
  weeks: 8,
  form: emptyForm,
}

function initialState(classId, params) {
  const plan = classId ? getPlan(classId) : null
  const date = params.get('date')
  const time = params.get('time')
  const hasSlot = isValidISODate(date) && isValidTime(time)

  if (!classId && !hasSlot) {
    const draft = loadDraft(DRAFT_KEY)
    if (draft?.version === DRAFT_VERSION) return { ...emptyState, ...draft, form: { ...emptyForm, ...draft.form } }
    return emptyState
  }

  const state = { ...emptyState }
  if (plan) {
    state.planId = plan.id
    state.step = 2
  }
  if (hasSlot) {
    Object.assign(state, { date, time, weekday: weekdayOf(date), weeklyTime: time, startDate: date })
  }
  return state
}

// 將使用者的選擇整理成可預約的內容；選擇不完整或時段已無法預約時回傳 null
function resolveSelection(state, slots) {
  const plan = getPlan(state.planId)
  if (!plan) return null
  const mode = plan.singleOnly ? 'single' : state.mode
  // 時段由會員包下，上課人數就是方案人數（會員 + 自己帶的朋友）
  const people = plan.capacity

  if (mode === 'single') {
    if (!state.date || !state.time) return null
    const slot = getSlot(slots, state.date, state.time)
    if (!canBookSlot(slot)) return null
    return {
      plan,
      mode,
      date: state.date,
      time: state.time,
      endTime: slot.endTime,
      weekday: weekdayOf(state.date),
      sessions: 1,
      discount: 1,
      people,
      price: calcPrice(plan, people, 1),
    }
  }

  const { weekday, weeklyTime: time, startDate, weeks } = state
  if (weekday == null || !time || !startDate) return null
  if (!weeklyStartOptions(slots, weekday, time, weeks).includes(startDate)) return null
  const pkg = weeklyPackages.find((p) => p.weeks === weeks) ?? weeklyPackages[0]
  return {
    plan,
    mode,
    weekday,
    startDate,
    weeks: pkg.weeks,
    time,
    endTime: addMinutes(time, SESSION_MINUTES),
    sessions: pkg.weeks,
    discount: pkg.discount,
    people,
    price: calcPrice(plan, people, pkg.weeks, pkg.discount),
  }
}

export default function Booking() {
  const { classId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const today = todayISO()
  const { index: slots, error: slotsError, reload: reloadSlots } = useSlots(today, addDays(today, BOOKING_RANGE_DAYS))
  const [state, setState] = useState(() => initialState(classId, params))
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    saveDraft(DRAFT_KEY, state)
  }, [state])

  const invalidClassId = classId && !getPlan(classId)
  const plan = getPlan(state.planId)
  const selection = resolveSelection(state, slots)
  const partnerCount = selection ? selection.people - 1 : 0
  const errors = validateInfo(state.form, partnerCount)
  const infoValid = Object.keys(errors).length === 0

  // 防止重新整理或資料過期時停在無效的步驟
  let step = state.step
  if (step >= 2 && !plan) step = 1
  if (step >= 3 && !selection) step = 2
  if (step >= 4 && !infoValid) step = 3

  const presetSlot = state.date && state.time ? getSlot(slots, state.date, state.time) : null

  const update = (patch) => setState((s) => ({ ...s, ...patch }))
  const updateForm = (patch) => setState((s) => ({ ...s, form: { ...s.form, ...patch } }))
  const goTo = (n) => {
    setSubmitError(null)
    update({ step: n })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectPlan = (planId) => {
    const next = getPlan(planId)
    update({ planId, mode: next.singleOnly ? 'single' : state.mode })
  }

  const nextFromInfo = () => {
    if (infoValid) return goTo(4)
    setTouched(Object.fromEntries(Object.keys(errors).map((k) => [k, true])))
    const first = Object.keys(errors)[0]
    document.getElementById(first)?.focus()
  }

  const confirm = async () => {
    if (submitting) return
    // 送出前再檢查一次時段是否仍可預約（最終仍以後端檢查為準）
    const fresh = resolveSelection(state, slots)
    if (!fresh || !infoValid) return goTo(fresh ? 3 : 2)

    setSubmitting(true)
    setSubmitError(null)
    const { form } = state
    const booking = {
      planId: fresh.plan.id,
      mode: fresh.mode,
      date: fresh.date ?? null,
      startDate: fresh.startDate ?? null,
      weeks: fresh.weeks ?? null,
      weekday: fresh.weekday,
      time: fresh.time,
      endTime: fresh.endTime,
      sessions: fresh.sessions,
      discount: fresh.discount,
      people: fresh.people,
      price: fresh.price,
      contact: { name: form.name.trim(), email: form.email.trim(), phone: normalizePhone(form.phone) },
      partners: form.partners.slice(0, partnerCount).map((p) => p.trim()),
      goal: form.goal,
      experience: form.experience,
      note: form.note.trim(),
    }

    try {
      const saved = await submitBooking(booking)
      clearDraft(DRAFT_KEY)
      navigate(`/booking/confirmation?ref=${saved.reference}`, { replace: true })
    } catch (err) {
      setSubmitting(false)
      if (err instanceof SlotTakenError) {
        // 時段在填資料的這段時間被其他人約走：回到選時段，並重新讀取最新的時段狀態
        setSubmitError('這個時段剛剛被其他人預約了，請重新選擇時段。你填的聯絡資料都還保留著。')
        update({ time: null, startDate: null, step: 2 })
        reloadSlots()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setSubmitError('預約送出失敗，請稍後再試，或直接透過 LINE 與我們聯絡。')
      }
    }
  }

  const canNext = (step === 1 && plan) || (step === 2 && selection) || step === 3

  return (
    <section className="booking">
      <div className="container">
        <div className="booking__head">
          <p className="eyebrow">Book a Session</p>
          <h1>線上預約</h1>
          <StepIndicator steps={BOOKING_STEPS} current={step} />
        </div>

        {invalidClassId && step === 1 && (
          <div className="notice notice--warn">
            <Icon name="target" size={18} />
            <span>找不到指定的課程方案，請從下方重新選擇。</span>
          </div>
        )}

        {slotsError && (
          <div className="notice notice--warn" role="alert">
            <Icon name="target" size={18} />
            <span>暫時無法取得最新的時段狀態，顯示的空堂可能已被預約，送出時會再確認一次。</span>
          </div>
        )}

        {submitError && (
          <div className="notice notice--warn" role="alert">
            <Icon name="target" size={18} />
            <span>{submitError}</span>
          </div>
        )}

        <div className="booking__layout">
          <div className="booking__main">
            {step === 1 && <PlanStep planId={state.planId} presetSlot={presetSlot} onSelect={selectPlan} />}
            {step === 2 && <TimeStep state={{ ...state, mode: plan.singleOnly ? 'single' : state.mode }} update={update} slots={slots} />}
            {step === 3 && (
              <InfoStep
                form={state.form}
                onChange={updateForm}
                errors={errors}
                touched={touched}
                onBlur={(k) => setTouched((t) => ({ ...t, [k]: true }))}
                partnerCount={partnerCount}
              />
            )}
            {step === 4 && (
              <div className="step-panel">
                <h2 className="step-panel__title">確認預約內容</h2>
                <p className="step-panel__lead">請確認以下資訊無誤。送出後教練會在 24 小時內與你聯繫，課程費用於上課當天現場付款。</p>
                <BookingDetails booking={{ ...selection, goal: state.form.goal, contact: state.form, partners: state.form.partners.slice(0, partnerCount) }} />
                <button type="button" className="text-btn" onClick={() => goTo(3)}>
                  修改聯絡資料
                </button>
              </div>
            )}

            <div className="step-nav">
              {step > 1 ? (
                <Button variant="ghost" onClick={() => goTo(step - 1)} disabled={submitting}>
                  上一步
                </Button>
              ) : (
                <Link to="/schedule" className="text-btn">
                  先看看課表
                </Link>
              )}
              {step < 4 ? (
                <Button onClick={() => (step === 3 ? nextFromInfo() : goTo(step + 1))} disabled={!canNext} arrow>
                  下一步
                </Button>
              ) : (
                <Button onClick={confirm} disabled={submitting} className={submitting ? 'is-loading' : ''}>
                  {submitting ? '送出中…' : '確認預約'}
                </Button>
              )}
            </div>
          </div>

          <aside className="booking__aside">
            <div className="summary-card summary-card--sticky">
              <h2 className="summary-card__title">預約摘要</h2>
              {plan ? (
                <>
                  <div className="summary-plan">
                    <span className={`badge badge--${plan.format}`}>{plan.formatLabel}</span>
                    <strong>{plan.name}</strong>
                  </div>
                  <dl className="facts facts--compact">
                    <div>
                      <dt>時段</dt>
                      <dd>
                        {selection
                          ? selection.mode === 'weekly'
                            ? `每${WEEKDAY_LABELS[selection.weekday]} ${selection.time}`
                            : `${formatDate(selection.date)} ${selection.time}`
                          : '尚未選擇'}
                      </dd>
                    </div>
                    {selection?.mode === 'weekly' && (
                      <div>
                        <dt>首堂</dt>
                        <dd>{formatDate(selection.startDate)}</dd>
                      </div>
                    )}
                    <div>
                      <dt>堂數</dt>
                      <dd>{selection ? `${selection.sessions} 堂` : '—'}</dd>
                    </div>
                    <div>
                      <dt>人數</dt>
                      <dd>{plan.capacity} 人</dd>
                    </div>
                  </dl>
                  <div className="summary-total">
                    <span>預估金額</span>
                    <strong>{selection ? formatPrice(selection.price.total) : `${formatPrice(plan.price)} 起`}</strong>
                  </div>
                </>
              ) : (
                <p className="hint">選擇方案後，這裡會顯示你的預約內容與費用。</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
