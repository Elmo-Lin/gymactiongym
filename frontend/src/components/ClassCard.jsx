import { Link } from 'react-router-dom'
import { priceSummary } from '../utils/booking'
import Icon from './Icon'

export default function ClassCard({ plan, showPrice = true }) {
  return (
    <article className="class-card">
      <div className="class-card__body">
        <div className="class-card__head">
          <span className={`badge badge--${plan.format}`}>{plan.formatLabel}</span>
          <p className="class-card__en">{plan.en}</p>
        </div>
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
            {plan.capacity} 位學員
          </li>
        </ul>
        <p className="class-card__desc">{plan.tagline}</p>
        <div className="class-card__footer">
          {showPrice && (
            <Link to="/classes#pricing" className="price" title="查看價目表">
              {priceSummary(plan).amount}
              <span>{priceSummary(plan).unit}</span>
            </Link>
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
