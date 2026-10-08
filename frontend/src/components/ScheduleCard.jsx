import { getPlan } from '../data/classes'
import { coach } from '../data/coach'
import { STATUS_LABELS } from '../utils/booking'
import Button from './Button'
import Icon from './Icon'

function spotsText(slot) {
  switch (slot.status) {
    case 'open':
      return '可預約 1–3 人'
    case 'joinable':
      return `剩 ${slot.spotsLeft} 個名額`
    case 'full':
    case 'taken':
      return '已額滿'
    default:
      return '—'
  }
}

export default function ScheduleCard({ slot }) {
  const plan = slot.planId ? getPlan(slot.planId) : null
  const bookable = slot.status === 'open' || slot.status === 'joinable'
  const to =
    slot.status === 'joinable'
      ? `/booking/${slot.planId}?date=${slot.date}&time=${slot.time}`
      : `/booking?date=${slot.date}&time=${slot.time}`

  return (
    <article className={`schedule-card schedule-card--${slot.status}`}>
      <div className="schedule-card__time">
        <strong>{slot.time}</strong>
        <span>{slot.endTime}</span>
      </div>

      <div className="schedule-card__info">
        <span className={`status status--${slot.status}`}>{STATUS_LABELS[slot.status]}</span>
        <h3>{plan ? plan.name : '空堂・可選 1對1 / 1對2 / 1對3'}</h3>
        <ul className="meta">
          <li>
            <Icon name="user" size={15} />
            {coach.name}
          </li>
          <li>
            <Icon name="clock" size={15} />
            {slot.duration} 分鐘
          </li>
          <li className={`spots spots--${slot.status}`}>
            <Icon name="users" size={15} />
            {spotsText(slot)}
          </li>
        </ul>
        {plan && slot.type === 'group' && (
          <div className="seat-dots" aria-label={`${slot.members} / ${slot.capacity} 人`}>
            {Array.from({ length: slot.capacity }, (_, i) => (
              <span key={i} className={i < slot.members ? 'is-filled' : ''} />
            ))}
          </div>
        )}
      </div>

      <div className="schedule-card__action">
        {bookable ? (
          <Button to={to} size="sm" variant={slot.status === 'joinable' ? 'secondary' : 'primary'}>
            {slot.status === 'joinable' ? '加入' : '預約'}
          </Button>
        ) : (
          <span className="schedule-card__disabled">{slot.status === 'past' ? '已結束' : '額滿'}</span>
        )}
      </div>
    </article>
  )
}
