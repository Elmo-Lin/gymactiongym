import Icon from './Icon'

export default function StepIndicator({ steps, current }) {
  return (
    <ol className="steps" aria-label="預約步驟">
      {steps.map((label, i) => {
        const n = i + 1
        const state = n < current ? 'done' : n === current ? 'current' : 'todo'
        return (
          <li key={label} className={`steps__item steps__item--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="steps__dot">{state === 'done' ? <Icon name="check" size={14} strokeWidth={2.5} /> : n}</span>
            <span className="steps__label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
