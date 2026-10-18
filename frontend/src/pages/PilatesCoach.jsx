import Button from '../components/Button'
import CoachPhoto from '../components/CoachPhoto'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import { pilatesCoach } from '../data/pilates'

// 皮拉提斯教練介紹（/pilates/coach）
export default function PilatesCoach() {
  return (
    <>
      <PageHeader eyebrow="Pilates Coach" title="皮拉提斯教練介紹">
        器械皮拉提斯由{pilatesCoach.name}授課，每一堂都依你的身體狀況調整器械與動作。
      </PageHeader>

      <section className="section">
        <div className="container coach-profile">
          <div className="coach-profile__media">
            <CoachPhoto person={pilatesCoach} className="rounded-xl coach-profile__photo" eager />
          </div>
          <div className="coach-profile__body">
            <p className="eyebrow">{pilatesCoach.title}</p>
            <h2 className="coach-profile__name">{pilatesCoach.name}</h2>
            <blockquote className="coach-card__quote">「{pilatesCoach.intro}」</blockquote>
            {pilatesCoach.bio.map((p) => (
              <p key={p.slice(0, 12)} className="body-text">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container two-col">
          <div>
            <h2 className="detail__heading">專業證照</h2>
            <ul className="check-list">
              {pilatesCoach.certifications.map((c) => (
                <li key={c}>
                  <Icon name="check" size={18} strokeWidth={2.4} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="detail__heading">專長領域</h2>
            <ul className="tags tags--lg">
              {pilatesCoach.specialties.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="center-actions">
            <Button to="/booking?program=pilates" size="lg" arrow>
              預約皮拉提斯
            </Button>
            <Button to="/pilates/schedule" size="lg" variant="secondary">
              查看皮拉提斯課表
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
