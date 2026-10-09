import { coach } from '../data/coach'
import Button from './Button'
import CoachPhoto from './CoachPhoto'

export default function CoachCard() {
  return (
    <article className={`coach-card ${coach.photo ? '' : 'coach-card--placeholder'}`}>
      <CoachPhoto className="coach-card__photo" />
      <div className="coach-card__body">
        <p className="eyebrow">{coach.title}</p>
        <h3 className="coach-card__name">{coach.name}</h3>
        <blockquote className="coach-card__quote">「{coach.intro}」</blockquote>
        <ul className="tags">
          {coach.specialties.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <dl className="stats">
          {coach.stats.map((s) => (
            <div key={s.label}>
              <dt>{s.value}</dt>
              <dd>{s.label}</dd>
            </div>
          ))}
        </dl>
        <Button to="/coach" variant="secondary" arrow>
          認識教練
        </Button>
      </div>
    </article>
  )
}
