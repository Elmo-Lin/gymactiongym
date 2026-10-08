import { Link } from 'react-router-dom'

// 參考招牌：ACTION 的 I 以綠色閃電取代
export function Bolt({ className = '' }) {
  return (
    <svg className={`bolt ${className}`} viewBox="0 0 20 40" aria-hidden="true">
      <path d="M14 0 3.5 23H10L5 40 17 14.5h-6.8L14 0Z" fill="currentColor" />
    </svg>
  )
}

export default function Logo({ light = false, onClick }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo--light' : ''}`} onClick={onClick} aria-label="即動 ACTION GYM 首頁">
      <span className="logo__zh">即動</span>
      <span className="logo__en">
        ACT
        <Bolt />
        ON GYM
      </span>
    </Link>
  )
}
