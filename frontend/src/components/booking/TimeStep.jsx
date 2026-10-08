import { getPlan, weeklyPackages } from '../../data/classes'
import { weeklySchedule } from '../../data/schedule'
import { canBookSlot, getSlotsForDate, getUpcomingDates, isClosedDay, weeklyStartOptions } from '../../utils/booking'
import { formatDate, formatMonthDay, WEEK_ORDER, WEEKDAY_LABELS, WEEKDAY_SHORT, weekdayOf } from '../../utils/date'
import Icon from '../Icon'

function slotHint(slot, planId) {
  if (slot.status === 'past') return '已結束'
  if (slot.status === 'full' || slot.status === 'taken') return '已額滿'
  if (slot.status === 'open') return '空堂'
  if (canBookSlot(slot, planId)) return `加入固定班・剩 ${slot.spotsLeft} 位`
  return `${getPlan(slot.planId).formatLabel} 固定班`
}

export default function TimeStep({ state, update, bookings }) {
  const plan = getPlan(state.planId)
  const dates = getUpcomingDates(14)

  const daySlots = state.date ? getSlotsForDate(state.date, bookings) : []

  const weeklySlots = state.weekday != null ? weeklySchedule[state.weekday] ?? [] : []
  const startOptions =
    state.weekday != null && state.weeklyTime
      ? weeklyStartOptions(state.weekday, state.weeklyTime, state.weeks, state.planId, bookings)
      : []

  return (
    <div className="step-panel">
      <h2 className="step-panel__title">選擇日期與時間</h2>
      <p className="step-panel__lead">
        {plan.singleOnly
          ? '體驗課為單次預約，請選擇方便的日期與時段。'
          : '可以先單次上課，或直接固定每週同一時段——大部分學員都選擇固定時段，比較容易養成習慣。'}
      </p>

      {!plan.singleOnly && (
        <div className="mode-toggle" role="radiogroup" aria-label="預約方式">
          <button
            type="button"
            role="radio"
            aria-checked={state.mode === 'single'}
            className={state.mode === 'single' ? 'is-active' : ''}
            onClick={() => update({ mode: 'single' })}
          >
            <Icon name="calendar" size={20} />
            <span>
              <strong>單次上課</strong>
              <small>選擇一個日期與時段</small>
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={state.mode === 'weekly'}
            className={state.mode === 'weekly' ? 'is-active' : ''}
            onClick={() => update({ mode: 'weekly' })}
          >
            <Icon name="repeat" size={20} />
            <span>
              <strong>固定每週時段</strong>
              <small>每週同一時間，最高享 9 折</small>
            </span>
          </button>
        </div>
      )}

      {state.mode === 'single' || plan.singleOnly ? (
        <>
          <h3 className="field-title">日期</h3>
          <div className="date-strip">
            {dates.map((iso) => {
              const closed = isClosedDay(iso)
              const hasSlot = !closed && getSlotsForDate(iso, bookings).some((s) => canBookSlot(s, state.planId))
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!hasSlot}
                  className={`date-chip ${state.date === iso ? 'date-chip--active' : ''}`}
                  onClick={() => update({ date: iso, time: null })}
                >
                  <span>{WEEKDAY_SHORT[weekdayOf(iso)]}</span>
                  <strong>{formatMonthDay(iso)}</strong>
                  <small>{closed ? '公休' : hasSlot ? '可預約' : '額滿'}</small>
                </button>
              )
            })}
          </div>

          <h3 className="field-title">時段</h3>
          {!state.date ? (
            <p className="hint">請先選擇日期。</p>
          ) : (
            <div className="slot-grid">
              {daySlots.map((slot) => {
                const ok = canBookSlot(slot, state.planId)
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!ok}
                    className={`slot ${ok && state.time === slot.time ? 'slot--active' : ''}`}
                    onClick={() => update({ time: slot.time })}
                  >
                    <strong>
                      {slot.time}–{slot.endTime}
                    </strong>
                    <small>{slotHint(slot, state.planId)}</small>
                  </button>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <h3 className="field-title">上課週數</h3>
          <div className="package-options">
            {weeklyPackages.map((p) => (
              <button
                key={p.weeks}
                type="button"
                className={`package ${state.weeks === p.weeks ? 'package--active' : ''}`}
                onClick={() => update({ weeks: p.weeks, startDate: null })}
              >
                <strong>{p.label}</strong>
                <span>共 {p.weeks} 堂</span>
                <em>{p.note}</em>
              </button>
            ))}
          </div>

          <h3 className="field-title">每週上課日</h3>
          <div className="weekday-chips">
            {WEEK_ORDER.filter((d) => (weeklySchedule[d] ?? []).length > 0).map((d) => (
              <button
                key={d}
                type="button"
                className={`chip ${state.weekday === d ? 'chip--active' : ''}`}
                onClick={() => update({ weekday: d, weeklyTime: null, startDate: null })}
              >
                {WEEKDAY_LABELS[d]}
              </button>
            ))}
          </div>

          <h3 className="field-title">固定時段</h3>
          {state.weekday == null ? (
            <p className="hint">請先選擇每週上課日。</p>
          ) : (
            <div className="slot-grid">
              {weeklySlots.map((base) => {
                const starts = weeklyStartOptions(state.weekday, base.time, state.weeks, state.planId, bookings)
                const ok = starts.length > 0
                const isGroup = base.type === 'group'
                const groupPlan = isGroup ? getPlan(base.planId) : null
                let hint = '空堂'
                if (isGroup) hint = base.planId === state.planId && ok ? '加入固定班' : `${groupPlan.formatLabel} 固定班`
                if (!ok && !isGroup) hint = '近期已被預約'
                return (
                  <button
                    key={base.time}
                    type="button"
                    disabled={!ok}
                    className={`slot ${state.weeklyTime === base.time ? 'slot--active' : ''}`}
                    onClick={() => update({ weeklyTime: base.time, startDate: null })}
                  >
                    <strong>每{WEEKDAY_LABELS[state.weekday]} {base.time}</strong>
                    <small>{hint}</small>
                  </button>
                )
              })}
            </div>
          )}

          {state.weeklyTime && (
            <>
              <h3 className="field-title">第一堂課日期</h3>
              {startOptions.length > 0 ? (
                <div className="weekday-chips">
                  {startOptions.map((iso) => (
                    <button
                      key={iso}
                      type="button"
                      className={`chip ${state.startDate === iso ? 'chip--active' : ''}`}
                      onClick={() => update({ startDate: iso })}
                    >
                      {formatDate(iso)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="hint">這個時段近期沒有連續 {state.weeks} 週的空檔，請改選其他時段或週數。</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
