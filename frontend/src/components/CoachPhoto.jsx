import { coach } from '../data/coach'
import { Bolt } from './Logo'
import Photo from './Photo'

// 教練照片。還沒有實拍照時用品牌圖案代替，不放模特兒的照片，避免客人誤以為是教練本人
export default function CoachPhoto({ className = '', eager = false }) {
  if (coach.photo) return <Photo src={coach.photo} alt={coach.name} className={className} eager={eager} />

  return (
    <div className={`coach-placeholder ${className}`} role="img" aria-label={coach.name}>
      <Bolt className="coach-placeholder__bolt" />
    </div>
  )
}
