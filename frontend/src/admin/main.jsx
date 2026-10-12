import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './base.css'
import './coach.css'
import AdminRoot from './AdminRoot.jsx'
import { TODAY, toISO } from './data.js'

// 「今天」（data.js 的 TODAY）只在頁面載入時算一次。後台常常整天開著，或從手機主畫面切回來，
// 所以切回後台時、以及每 5 分鐘檢查一次：日期已經變了就重新整理，今天的課表與資料才會是最新的
const reloadIfDateChanged = () => {
  if (document.visibilityState === 'visible' && toISO(new Date()) !== TODAY) window.location.reload()
}
document.addEventListener('visibilitychange', reloadIfDateChanged)
window.addEventListener('focus', reloadIfDateChanged)
window.setInterval(reloadIfDateChanged, 5 * 60 * 1000)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminRoot />
  </StrictMode>,
)
