import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/booking'
import Icon from './Icon'
import PlanVisual from './PlanVisual'

export default function ClassCard({ plan, showPrice = true }) {
  return (
    <article className="class-card">
      <Link to={`/classes/${plan.id}`} className="class-card__media" tabIndex={-1} aria-hidden="true">
        <PlanVisual plan={plan} />
      </Link>
      <div className="class-card__body">
        <p className="class-card__en">{plan.en}</p>
        <h3 className="class-card__title">
          <Link to={`/classes/${plan.id}`}>{plan.name}</Link>
        </h3>
        <ul className="meta">
          <li>
            <Icon name="clock" size={16} />
            {plan.duration} 分鐘
          </li>
          <li>
            <Icon name="users" size={16} />
            {plan.capacity === 1 ? '1 位學員' : `最多 ${plan.capacity} 位學員`}
          </li>
        </ul>
        <p className="class-card__desc">{plan.tagline}</p>
        <div className="class-card__footer">
          {showPrice && (
            <p className="price">
              {formatPrice(plan.price)}
              <span>／每人每堂</span>
            </p>
          )}
          <Link to={`/classes/${plan.id}`} className="link-arrow">
            查看方案
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </div>
    </article>
  )
}
