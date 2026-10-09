import { Link, useParams } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import CoachPhoto from '../components/CoachPhoto'
import PlanVisual from '../components/PlanVisual'
import { getPlan, plans, weeklyPackages } from '../data/classes'
import { coach } from '../data/coach'
import { useSlots } from '../services/slots'
import { formatPrice, getUpcomingAvailable } from '../utils/booking'
import { addDays, formatDate, todayISO } from '../utils/date'
import NotFound from './NotFound'

export default function ClassDetail() {
  const { id } = useParams()
  const plan = getPlan(id)
  // hook 必須在 return 之前呼叫，所以放在檢查方案是否存在之前
  const today = todayISO()
  const { index } = useSlots(today, addDays(today, 6))

  if (!plan) {
    return <NotFound title="找不到這個課程方案" text="這個方案可能已經調整或不存在，請回到課程列表重新選擇。" to="/classes" cta="回到課程方案" />
  }

  const sessions = getUpcomingAvailable(index, 7, 6)
  const others = plans.filter((p) => p.id !== plan.id).slice(0, 3)

  return (
    <>
      <section className="detail-hero">
        <PlanVisual plan={plan} className="detail-hero__bg plan-visual--hero" />
        <div className="detail-hero__overlay" />
        <div className="container detail-hero__content">
          <Link to="/classes" className="back-link">
            <Icon name="arrowLeft" size={16} />
            所有方案
          </Link>
          <span className={`badge badge--${plan.format}`}>{plan.formatLabel}</span>
          <h1>{plan.name}</h1>
          <p>{plan.tagline}</p>
        </div>
      </section>

      <section className="section">
        <div className="container detail">
          <div className="detail__main">
            <p className="lead">{plan.description}</p>

            <h2 className="detail__heading">課程內容</h2>
            <ul className="check-list">
              {plan.expect.map((e) => (
                <li key={e}>
                  <Icon name="check" size={18} strokeWidth={2.4} />
                  {e}
                </li>
              ))}
            </ul>

            <h2 className="detail__heading">適合對象</h2>
            <ul className="pill-list">
              {plan.suitable.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>

            <h2 className="detail__heading">授課教練</h2>
            <Link to="/coach" className="mini-coach">
              <CoachPhoto className="mini-coach__photo" />
              <div>
                <strong>{coach.name}</strong>
                <span>
                  {coach.title}・{coach.years} 年教學經驗
                </span>
              </div>
              <Icon name="arrow" size={18} />
            </Link>

            <h2 className="detail__heading">近期可預約時段</h2>
            {sessions.length > 0 ? (
              <ul className="session-list">
                {sessions.map((s) => (
                  <li key={`${s.date}-${s.time}`}>
                    <Link to={`/booking/${plan.id}?date=${s.date}&time=${s.time}`} className="session-chip">
                      <span>{formatDate(s.date)}</span>
                      <strong>
                        {s.time}–{s.endTime}
                      </strong>
                      <em>空堂</em>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty empty--compact">
                <p>未來 7 天沒有可預約的時段，請查看完整課表或與我們聯繫。</p>
                <Button to="/schedule" variant="secondary" size="sm">
                  查看課表
                </Button>
              </div>
            )}
          </div>

          <aside className="detail__aside">
            <div className="summary-card">
              <p className="price price--lg">
                {formatPrice(plan.price)}
                <span>／每人每堂</span>
              </p>
              <dl className="facts">
                <div>
                  <dt>上課人數</dt>
                  <dd>{plan.capacity === 1 ? '1 人' : `${plan.capacity} 人`}</dd>
                </div>
                <div>
                  <dt>課程長度</dt>
                  <dd>{plan.duration} 分鐘</dd>
                </div>
                <div>
                  <dt>每堂總費用</dt>
                  <dd>{formatPrice(plan.price * plan.capacity)}</dd>
                </div>
                <div>
                  <dt>預約方式</dt>
                  <dd>{plan.singleOnly ? '單次預約' : '單次 / 固定每週'}</dd>
                </div>
              </dl>
              {!plan.singleOnly && (
                <div className="package-mini">
                  {weeklyPackages.map((p) => (
                    <div key={p.weeks}>
                      <span>固定 {p.label}</span>
                      <strong>{p.note}</strong>
                    </div>
                  ))}
                </div>
              )}
              <Button to={`/booking/${plan.id}`} size="lg" block arrow>
                預約此課程
              </Button>
              <p className="summary-card__note">線上預約不需付款，課程當天於現場付費。</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <h2 className="detail__heading">其他方案</h2>
          <div className="other-plans">
            {others.map((p) => (
              <Link key={p.id} to={`/classes/${p.id}`} className="other-plan">
                <PlanVisual plan={p} className="other-plan__photo" />
                <div>
                  <span className={`badge badge--${p.format}`}>{p.formatLabel}</span>
                  <strong>{p.name}</strong>
                  <span>{formatPrice(p.price)}／每人每堂</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
