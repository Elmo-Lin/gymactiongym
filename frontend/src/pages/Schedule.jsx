import { useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import ScheduleCard from '../components/ScheduleCard'
import { studioInfo } from '../data/schedule'
import { getSlotsForDate, isClosedDay } from '../utils/booking'
import { addDays, formatDateLong, formatMonthDay, isValidISODate, startOfWeek, todayISO, WEEKDAY_LABELS, weekdayOf } from '../utils/date'
import { loadBookings } from '../utils/storage'

const legend = [
  { status: 'open', label: '空堂：可預約任何方案' },
  { status: 'joinable', label: '固定班有空位：可單獨加入' },
  { status: 'full', label: '固定班已額滿' },
]

export default function Schedule() {
  const [params, setParams] = useSearchParams()
  const today = todayISO()
  const thisWeek = startOfWeek(today)
  const lastDay = addDays(thisWeek, 13)

  const requested = params.get('date')
  const selected = isValidISODate(requested) && requested >= thisWeek && requested <= lastDay ? requested : today
  const weekStart = startOfWeek(selected)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const bookings = loadBookings()
  const slotsByDay = Object.fromEntries(days.map((d) => [d, getSlotsForDate(d, bookings)]))
  const slots = slotsByDay[selected] ?? []
  const available = slots.filter((s) => s.status === 'open' || s.status === 'joinable').length

  const selectDate = (iso) => setParams({ date: iso }, { replace: true })
  const switchWeek = (offset) => {
    const start = addDays(thisWeek, offset * 7)
    const sameWeekday = addDays(start, (weekdayOf(selected) + 6) % 7)
    selectDate(offset === 0 && sameWeekday < today ? today : sameWeekday)
  }
  const isNextWeek = weekStart !== thisWeek

  return (
    <>
      <PageHeader eyebrow="Schedule" title="每週課表">
        大部分學員都在每週固定時段上課。空堂可直接預約，固定班若還有名額也可以單獨加入。
      </PageHeader>

      <section className="section section--schedule">
        <div className="container">
          <div className="schedule-toolbar">
            <div className="segmented" role="group" aria-label="切換週次">
              <button type="button" className={!isNextWeek ? 'is-active' : ''} onClick={() => switchWeek(0)}>
                本週
              </button>
              <button type="button" className={isNextWeek ? 'is-active' : ''} onClick={() => switchWeek(1)}>
                下週
              </button>
            </div>
            <ul className="legend">
              {legend.map((l) => (
                <li key={l.status}>
                  <span className={`legend__dot legend__dot--${l.status}`} />
                  {l.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="day-tabs" role="tablist" aria-label="選擇日期">
            {days.map((d) => {
              const daySlots = slotsByDay[d] ?? []
              const open = daySlots.filter((s) => s.status === 'open' || s.status === 'joinable').length
              const closed = isClosedDay(d)
              return (
                <button
                  key={d}
                  type="button"
                  role="tab"
                  aria-selected={d === selected}
                  className={`day-tab ${d === selected ? 'day-tab--active' : ''} ${d < today ? 'day-tab--past' : ''}`}
                  onClick={() => selectDate(d)}
                >
                  <span className="day-tab__name">{WEEKDAY_LABELS[weekdayOf(d)]}</span>
                  <span className="day-tab__date">{formatMonthDay(d)}</span>
                  <span className="day-tab__count">{closed ? '公休' : d < today ? '已結束' : d === today ? '今天' : open > 0 ? `${open} 空堂` : '額滿'}</span>
                </button>
              )
            })}
          </div>

          <div className="schedule-day">
            <div className="schedule-day__head">
              <h2>{formatDateLong(selected)}</h2>
              {!isClosedDay(selected) && slots.length > 0 && (
                <p>{available > 0 ? `${available} 個時段可預約` : '本日時段皆已額滿或結束'}</p>
              )}
            </div>

            {isClosedDay(selected) || slots.length === 0 ? (
              <div className="empty">
                <Icon name="calendar" size={32} />
                <h3>本日公休</h3>
                <p>
                  營業時間：
                  {studioInfo.hours
                    .filter((h) => h.time !== '公休')
                    .map((h) => `${h.days} ${h.time}`)
                    .join('、')}
                </p>
                <Button variant="secondary" onClick={() => selectDate(addDays(selected, 1) <= lastDay ? addDays(selected, 1) : addDays(selected, -1))}>
                  查看其他日期
                </Button>
              </div>
            ) : (
              <div className="schedule-list">
                {slots.map((slot) => (
                  <ScheduleCard key={slot.time} slot={slot} />
                ))}
              </div>
            )}
          </div>

          <div className="schedule-help">
            <Icon name="repeat" size={22} />
            <p>
              <strong>想要固定每週上課？</strong>
              選擇任一空堂後，在預約流程中切換為「固定每週時段」，教練會為你保留 4–12 週的同一時段。
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
