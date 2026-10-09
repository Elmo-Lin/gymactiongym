import { Bolt } from './Logo'

// 課程方案的視覺：不用照片，以上課人數的大字搭配品牌色與閃電，三個方案的風格才會一致
const LABELS = { trial: '體驗', solo: '1:1', duo: '1:2' }

export default function PlanVisual({ plan, className = '' }) {
  return (
    <div className={`plan-visual plan-visual--${plan.format} ${className}`} aria-hidden="true">
      <span className="plan-visual__label">{LABELS[plan.format] ?? plan.formatLabel}</span>
      <Bolt className="plan-visual__bolt" />
    </div>
  )
}
