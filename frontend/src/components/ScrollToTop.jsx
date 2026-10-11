import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// 換頁時捲回最上方；網址有 #錨點（例如 /classes#pricing）時，改捲到那個區塊
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
    if (target) target.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
