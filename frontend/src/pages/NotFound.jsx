import Button from '../components/Button'
import { Bolt } from '../components/Logo'

export default function NotFound({
  title = '找不到這個頁面',
  text = '你要找的頁面可能已移除或網址有誤。',
  to = '/',
  cta = '回到首頁',
}) {
  return (
    <section className="section">
      <div className="container empty empty--page">
        <Bolt className="empty__bolt" />
        <h1>{title}</h1>
        <p>{text}</p>
        <Button to={to} arrow>
          {cta}
        </Button>
      </div>
    </section>
  )
}
