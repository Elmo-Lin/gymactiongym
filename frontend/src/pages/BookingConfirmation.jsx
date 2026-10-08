import { useSearchParams } from 'react-router-dom'
import BookingDetails from '../components/booking/BookingDetails'
import Button from '../components/Button'
import Icon from '../components/Icon'
import StepIndicator from '../components/StepIndicator'
import { getPlan } from '../data/classes'
import { studioInfo } from '../data/schedule'
import { BOOKING_STEPS } from '../utils/booking'
import { findBooking, loadBookings } from '../utils/storage'

export default function BookingConfirmation() {
  const [params] = useSearchParams()
  const ref = params.get('ref')
  const stored = ref ? findBooking(ref) : loadBookings().slice(-1)[0]
  const plan = stored ? getPlan(stored.planId) : null

  if (!stored || !plan) {
    return (
      <section className="booking">
        <div className="container empty empty--page">
          <Icon name="calendar" size={36} />
          <h1>找不到預約紀錄</h1>
          <p>這個預約編號不存在，或是預約資料已從這個瀏覽器清除。</p>
          <Button to="/booking" arrow>
            重新預約
          </Button>
        </div>
      </section>
    )
  }

  const booking = { ...stored, plan }

  return (
    <section className="booking">
      <div className="container confirmation">
        <StepIndicator steps={BOOKING_STEPS} current={6} />

        <div className="confirmation__hero">
          <span className="confirmation__icon">
            <Icon name="check" size={36} strokeWidth={2.6} />
          </span>
          <h1>預約成功！</h1>
          <p>
            {booking.contact.name} 你好，我們已收到你的預約。教練會在 24 小時內透過電話或 LINE 與你確認。
          </p>
          <div className="reference">
            <span>預約編號</span>
            <strong>{booking.reference}</strong>
          </div>
        </div>

        <div className="summary-card">
          <BookingDetails booking={booking} />
        </div>

        <div className="next-steps">
          <h2>上課前小提醒</h2>
          <ul className="check-list">
            <li>
              <Icon name="check" size={18} strokeWidth={2.4} />
              請提早 10 分鐘到場暖身，穿著運動服與室內運動鞋
            </li>
            <li>
              <Icon name="check" size={18} strokeWidth={2.4} />
              課程費用於上課當天現場付款，可使用現金或轉帳
            </li>
            <li>
              <Icon name="check" size={18} strokeWidth={2.4} />
              如需取消或更改，請於 24 小時前透過 LINE {studioInfo.line} 告知
            </li>
            <li>
              <Icon name="pin" size={18} />
              <a href={studioInfo.mapUrl} target="_blank" rel="noreferrer" className="inline-link">
                {studioInfo.address}
              </a>
            </li>
          </ul>
        </div>

        <div className="center-actions">
          <Button to="/" variant="secondary">
            回到首頁
          </Button>
          <Button to="/schedule" arrow>
            查看課表
          </Button>
        </div>
      </div>
    </section>
  )
}
