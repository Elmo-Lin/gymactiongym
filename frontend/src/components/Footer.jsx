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
          <p>位於桃園楊梅的小班制工作室，提供肌力訓練與器械皮拉提斯，每個時段只服務一組學員。</p>
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
            {navLinks.flatMap((link) =>
              link.children
                ? link.children.map((child) => (
                    <li key={child.to}>
                      <Link to={child.to}>
                        {link.label}・{child.label}
                      </Link>
                    </li>
                  ))
                : [
                    <li key={link.to}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>,
                  ],
            )}
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
        {/* 教練後台是另一個頁面（admin.html），用一般連結整頁開啟，不走網站內的換頁 */}
        <a href="/admin" className="footer__admin" rel="nofollow">
          教練登入
        </a>
      </div>
    </footer>
  )
}
