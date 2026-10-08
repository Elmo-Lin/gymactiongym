import Button from '../components/Button'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Photo from '../components/Photo'
import SectionHeading from '../components/SectionHeading'
import { coach } from '../data/coach'

export default function Coach() {
  return (
    <>
      <PageHeader eyebrow="Your Coach" title="教練介紹">
        即動只有一位教練。從第一堂體驗課到之後的每一堂，都是同一個人在你身邊。
      </PageHeader>

      <section className="section">
        <div className="container coach-profile">
          <div className="coach-profile__media">
            <Photo src={coach.photo} alt={coach.name} className="rounded-xl coach-profile__photo" eager />
          </div>
          <div className="coach-profile__body">
            <p className="eyebrow">{coach.title}</p>
            <h2 className="coach-profile__name">{coach.name}</h2>
            <blockquote className="coach-card__quote">「{coach.intro}」</blockquote>
            {coach.bio.map((p) => (
              <p key={p.slice(0, 12)} className="body-text">
                {p}
              </p>
            ))}
            <dl className="stats stats--dark">
              {coach.stats.map((s) => (
                <div key={s.label}>
                  <dt>{s.value}</dt>
                  <dd>{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container two-col">
          <div>
            <h2 className="detail__heading">專業證照</h2>
            <ul className="check-list">
              {coach.certifications.map((c) => (
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
              {coach.specialties.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="學員回饋" title="每週準時報到的他們這樣說" />
          <div className="testimonials">
            {coach.testimonials.map((t) => (
              <figure key={t.name} className="testimonial">
                <blockquote>「{t.text}」</blockquote>
                <figcaption>
                  <strong>{t.name}</strong>
                  <span>{t.plan}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="center-actions">
            <Button to="/booking/trial" size="lg" arrow>
              預約體驗課
            </Button>
            <Button to="/schedule" size="lg" variant="secondary">
              查看教練課表
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
