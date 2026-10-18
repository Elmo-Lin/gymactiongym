import { trainingGoals } from '../../data/classes'
import { getProgram } from '../../data/programs'
import { addDays, formatDate, WEEKDAY_LABELS } from '../../utils/date'

// 預約確認頁與完成頁共用的明細。預約只確認時間，不顯示價格（方案與價格見課程方案頁）
export default function BookingDetails({ booking, showContact = true }) {
  const { plan, mode, people, sessions } = booking
  const goal = trainingGoals.find((g) => g.id === booking.goal)

  const rows = [
    ['課程方案', plan.name],
    ['教練', getProgram(plan.program).coach.name],
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
    </div>
  )
}
