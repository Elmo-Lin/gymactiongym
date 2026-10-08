import { Link } from 'react-router-dom'
import { config } from '../config'
import { studioInfo } from '../data/schedule'
import Icon from './Icon'
import Logo from './Logo'
import { navLinks } from '../data/navigation'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo light />
          <p>一位教練、最多兩位學員。位於桃園楊梅的小型肌力訓練工作室。</p>
          <a className="footer__rating" href={studioInfo.mapUrl} target="_blank" rel="noreferrer">
            <span aria-hidden="true">★★★★★</span>
            Google 評價 {studioInfo.rating.score}（{studioInfo.rating.count} 則）
          </a>
          <a
            className="footer__social"
            href={studioInfo.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <Icon name="instagram" size={18} />
            {studioInfo.instagram}
          </a>
        </div>

        <div>
          <h3 className="footer__title">網站導覽</h3>
          <ul className="footer__list">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/booking">立即預約</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="footer__title">聯絡我們</h3>
          <ul className="footer__list footer__list--icons">
            <li>
              <Icon name="pin" size={16} />
              <a href={studioInfo.mapUrl} target="_blank" rel="noreferrer">
                {studioInfo.address}
              </a>
            </li>
            <li>
              <Icon name="phone" size={16} />
              <a href={`tel:${studioInfo.phone.replace(/[\s-]/g, '')}`}>{studioInfo.phone}</a>
            </li>
            <li>
              <Icon name="mail" size={16} />
              <a href={`mailto:${studioInfo.email}`}>{studioInfo.email}</a>
            </li>
            <li>
              <span className="footer__line">LINE</span>
              {studioInfo.line}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="footer__title">營業時間</h3>
          <dl className="footer__hours">
            {studioInfo.hours.map((h) => (
              <div key={h.days}>
                <dt>{h.days}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
          </dl>
          <p className="footer__note">全預約制，請於上課前預約時段。</p>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} 即動 ACTION GYM. All rights reserved.</p>
        {!config.useApi && <p>本網站預約功能為示範版本，資料僅儲存於您的瀏覽器。</p>}
      </div>
    </footer>
  )
}
