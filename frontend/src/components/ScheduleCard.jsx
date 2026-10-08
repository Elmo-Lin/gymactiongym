import { coach } from '../data/coach'
import { STATUS_LABELS } from '../utils/booking'
import Button from './Button'
import Icon from './Icon'

export default function ScheduleCard({ slot }) {
  const bookable = slot.status === 'open'

  return (
    <article className={`schedule-card schedule-card--${slot.status}`}>
      <div className="schedule-card__time">
        <strong>{slot.time}</strong>
        <span>{slot.endTime}</span>
      </div>

      <div className="schedule-card__info">
        <span className={`status status--${slot.status}`}>{STATUS_LABELS[slot.status]}</span>
        <h3>{bookable ? '空堂・可選 1對1 / 1對2' : '私人時段'}</h3>
        <ul className="meta">
          <li>
            <Icon name="user" size={15} />
            {coach.name}
          </li>
          <li>
            <Icon name="clock" size={15} />
            {slot.duration} 分鐘
          </li>
          {bookable && (
            <li className="spots spots--open">
              <Icon name="users" size={15} />
              可自己帶 1 位朋友
            </li>
          )}
        </ul>
      </div>

      <div className="schedule-card__action">
        {bookable ? (
          <Button to={`/booking?date=${slot.date}&time=${slot.time}`} size="sm">
            預約
          </Button>
        ) : (
          <span className="schedule-card__disabled">{slot.status === 'past' ? '已結束' : '已被預約'}</span>
        )}
      </div>
    </article>
  )
}
