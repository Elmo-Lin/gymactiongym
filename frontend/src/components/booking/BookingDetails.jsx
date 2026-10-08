import { coach } from '../../data/coach'
import { trainingGoals } from '../../data/classes'
import { formatPrice } from '../../utils/booking'
import { addDays, formatDate, WEEKDAY_LABELS } from '../../utils/date'

// 預約摘要與確認頁共用的明細
export default function BookingDetails({ booking, showContact = true }) {
  const { plan, mode, people, joining, price, sessions, discount } = booking
  const goal = trainingGoals.find((g) => g.id === booking.goal)

  const rows = [
    ['課程方案', `${plan.name}${joining ? '（加入固定班）' : ''}`],
    ['教練', coach.name],
    ['上課方式', mode === 'weekly' ? `固定每週・${booking.weeks} 週` : '單次上課'],
    mode === 'weekly'
      ? ['日期', `每${WEEKDAY_LABELS[booking.weekday]}・${formatDate(booking.startDate)} 起至 ${formatDate(addDays(booking.startDate, (booking.weeks - 1) * 7))}`]
      : ['日期', formatDate(booking.date)],
    ['時間', `${booking.time} – ${booking.endTime}`],
    ['課程長度', `${plan.duration} 分鐘 × ${sessions} 堂`],
    ['上課人數', `${people} 人`],
  ]

  if (showContact && booking.contact) {
    const names = [booking.contact.name, ...(booking.partners ?? [])].filter(Boolean)
    rows.push(['學員', names.join('、')])
    rows.push(['聯絡電話', booking.contact.phone])
    rows.push(['Email', booking.contact.email])
    if (goal) rows.push(['訓練目標', goal.label])
  }

  return (
    <div className="booking-details">
      <dl className="detail-rows">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <dl className="price-rows">
        <div>
          <dt>
            {formatPrice(plan.price)} × {people} 人 × {sessions} 堂
          </dt>
          <dd>{formatPrice(price.subtotal)}</dd>
        </div>
        {price.saved > 0 && (
          <div className="price-rows__discount">
            <dt>固定時段優惠（{Math.round(discount * 100)} 折）</dt>
            <dd>−{formatPrice(price.saved)}</dd>
          </div>
        )}
        <div className="price-rows__total">
          <dt>應付金額</dt>
          <dd>{formatPrice(price.total)}</dd>
        </div>
      </dl>
    </div>
  )
}
