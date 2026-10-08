import { plans } from '../../data/classes'
import { canBookSlot, formatPrice } from '../../utils/booking'
import { formatDate } from '../../utils/date'
import Icon from '../Icon'

export default function PlanStep({ planId, presetSlot, onSelect }) {
  return (
    <div className="step-panel">
      <h2 className="step-panel__title">選擇上課方式</h2>
      <p className="step-panel__lead">所有課程皆由同一位教練指導，每堂 60 分鐘。依上課人數選擇方案。</p>

      {presetSlot && (
        <div className="notice">
          <Icon name="calendar" size={18} />
          <span>
            已選擇時段：{formatDate(presetSlot.date)} {presetSlot.time}
            {presetSlot.status === 'joinable' && '（固定班，僅限相同方案加入）'}
          </span>
        </div>
      )}

      <div className="plan-options" role="radiogroup" aria-label="課程方案">
        {plans.map((plan) => {
          const incompatible = presetSlot && !canBookSlot(presetSlot, plan.id)
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={planId === plan.id}
              className={`plan-option ${planId === plan.id ? 'plan-option--active' : ''}`}
              onClick={() => onSelect(plan.id)}
            >
              <span className="plan-option__check">
                <Icon name="check" size={14} strokeWidth={3} />
              </span>
              <span className={`badge badge--${plan.format}`}>{plan.formatLabel}</span>
              <strong className="plan-option__name">{plan.name}</strong>
              <span className="plan-option__desc">{plan.tagline}</span>
              <span className="plan-option__meta">
                <span>
                  <Icon name="users" size={15} />
                  {plan.capacity} 人
                </span>
                <span>
                  <Icon name="clock" size={15} />
                  {plan.duration} 分鐘
                </span>
              </span>
              <span className="plan-option__price">
                {formatPrice(plan.price)}
                <small>／每人每堂</small>
              </span>
              {incompatible && <span className="plan-option__warn">已選時段不適用此方案，下一步需重新選擇時段</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
