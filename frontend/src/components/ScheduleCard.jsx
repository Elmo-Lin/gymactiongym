import { STATUS_LABELS } from '../utils/booking'
import Button from './Button'
import Icon from './Icon'

// program：這個時段屬於哪間教室（data/programs.js），決定教練、可帶的人數與預約連結
export default function ScheduleCard({ slot, program }) {
  const bookable = slot.status === 'open'
  const pilates = program.id === 'pilates'

  return (
    <article className={`schedule-card schedule-card--${slot.status}`}>
      <div className="schedule-card__time">
        <strong>{slot.time}</strong>
        <span>{slot.endTime}</span>
      </div>

      <div className="schedule-card__info">
        <span className={`status status--${slot.status}`}>{STATUS_LABELS[slot.status]}</span>
        <h3>{bookable ? (pilates ? '空堂・可選 1對1 / 1對2 / 團課' : '空堂・可選 1對1 / 1對2') : '私人時段'}</h3>
        <ul className="meta">
          <li>
            <Icon name="user" size={15} />
            {program.coach.name}
          </li>
          <li>
            <Icon name="clock" size={15} />
            {slot.duration} 分鐘
          </li>
          {bookable && (
            <li className="spots spots--open">
              <Icon name="users" size={15} />
              {pilates ? '可自己帶 1–3 位朋友' : '可自己帶 1 位朋友'}
            </li>
          )}
        </ul>
      </div>

      <div className="schedule-card__action">
        {bookable ? (
          <Button to={`/booking?program=${program.id}&date=${slot.date}&time=${slot.time}`} size="sm">
            預約
          </Button>
        ) : (
          <span className="schedule-card__disabled">{slot.status === 'past' ? '已結束' : '已被預約'}</span>
        )}
      </div>
    </article>
  )
}
