import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Button from './Button'
import Icon from './Icon'
import Logo from './Logo'
import { useCart } from '../context/cart'
import { navLinks } from '../data/navigation'

export default function Navbar() {
  // 若 React 載入前選單已被打開（見 index.html），沿用該狀態
  const [open, setOpen] = useState(() => typeof document !== 'undefined' && document.getElementById('mobile-menu')?.hidden === false)
  const { count } = useCart()
  const close = () => setOpen(false)

  useEffect(() => {
    window.__navbarReady = true
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className={`navbar ${open ? 'navbar--open' : ''}`}>
      <div className="container navbar__inner">
        <Logo light onClick={close} />

        <nav className="navbar__links" aria-label="主選單">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="navbar__link">
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__actions">
          <Link
            to="/cart"
            className="navbar__cart"
            aria-label={count > 0 ? `購物車，${count} 件商品` : '購物車'}
            onClick={close}
          >
            <Icon name="cart" size={22} />
            {count > 0 && <span className="navbar__cart-count">{count > 99 ? '99+' : count}</span>}
          </Link>
          <Button to="/booking" size="sm" className="navbar__cta">
            立即預約
          </Button>
          <button
            type="button"
            className="navbar__toggle"
            aria-label={open ? '關閉選單' : '開啟選單'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'close' : 'menu'} size={24} />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav className="container mobile-menu__links" aria-label="行動版選單">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="mobile-menu__link" onClick={close}>
              {link.label}
              <Icon name="arrow" size={18} />
            </NavLink>
          ))}
          <Button to="/booking" size="lg" block onClick={close}>
            立即預約
          </Button>
        </nav>
      </div>
    </header>
  )
}
