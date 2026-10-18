import { coach } from '../data/coach'
import Button from './Button'
import CoachPhoto from './CoachPhoto'

// 首頁的教練卡片。person：要顯示哪位教練（預設石頭教練）；to：「認識教練」連到的教練介紹頁
export default function CoachCard({ person = coach, to = '/coach' }) {
  return (
    <article className={`coach-card ${person.photo ? '' : 'coach-card--placeholder'}`}>
      <CoachPhoto person={person} className="coach-card__photo" />
      <div className="coach-card__body">
        <p className="eyebrow">{person.title}</p>
        <h3 className="coach-card__name">{person.name}</h3>
        <blockquote className="coach-card__quote">「{person.intro}」</blockquote>
        <ul className="tags">
          {person.specialties.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        {person.stats && (
          <dl className="stats">
            {person.stats.map((s) => (
              <div key={s.label}>
                <dt>{s.value}</dt>
                <dd>{s.label}</dd>
              </div>
            ))}
          </dl>
        )}
        <Button to={to} variant="secondary" arrow>
          認識{person.name}
        </Button>
      </div>
    </article>
  )
}
