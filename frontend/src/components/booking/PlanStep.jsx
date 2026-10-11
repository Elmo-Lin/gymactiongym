import { Link } from 'react-router-dom'
import { plans } from '../../data/classes'
import { formatDate } from '../../utils/date'
import Icon from '../Icon'

// 預約只是確認時間能不能約，不顯示價格；方案與價格請見課程方案頁
export default function PlanStep({ planId, presetSlot, onSelect }) {
  return (
    <div className="step-panel">
      <h2 className="step-panel__title">選擇上課方式</h2>
      <p className="step-panel__lead">
        所有課程皆由同一位教練指導，每堂 60 分鐘。每個時段只服務你這一組，想找朋友一起上課就選 1對2。
        <Link to="/classes" className="inline-link">
          想先了解方案與價格？
        </Link>
      </p>

      {presetSlot && (
        <div className="notice">
          <Icon name="calendar" size={18} />
          <span>
            已選擇時段：{formatDate(presetSlot.date)} {presetSlot.time}
          </span>
        </div>
      )}

      <div className="plan-options" role="radiogroup" aria-label="課程方案">
        {plans.map((plan) => (
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
          </button>
        ))}
      </div>
    </div>
  )
}
