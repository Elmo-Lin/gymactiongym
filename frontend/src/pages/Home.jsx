import Button from '../components/Button'
import ClassCard from '../components/ClassCard'
import CoachCard from '../components/CoachCard'
import Icon from '../components/Icon'
import { Bolt } from '../components/Logo'
import Photo from '../components/Photo'
import SectionHeading from '../components/SectionHeading'
import { plans } from '../data/classes'
import { images } from '../data/images'
import { studioInfo } from '../data/schedule'

const benefits = [
  {
    icon: 'target',
    title: '專屬的動作指導',
    text: '一位教練最多帶兩位學員，每一組、每一下都看得到，動作錯了當下就修正。',
  },
  {
    icon: 'repeat',
    title: '固定時段好堅持',
    text: '每週同一時間上課，把運動排進生活。和朋友約好一起練，也會讓你更不想缺席。',
  },
  {
    icon: 'users',
    title: '和朋友一起更划算',
    text: '1對2 兩人分攤費用，享有私教品質，卻是更親民的價格。',
  },
  {
    icon: 'shield',
    title: '安全、有效、看得見',
    text: '從動作檢測開始，循序漸進加重量；每 4 週重新評估，進步有數據可依循。',
  },
]

const process = [
  { title: '預約體驗課', text: '線上選擇時段，第一堂從諮詢與動作檢測開始。' },
  { title: '選擇上課方式', text: '一個人、兩個人或三個人，選擇最適合你的方案。' },
  { title: '固定每週時段', text: '鎖定每週固定時間，教練為你保留專屬時段。' },
  { title: '持續追蹤進步', text: '每 4 週檢測一次，依進度調整課表與重量。' },
]

export default function Home() {
  return (
    <>
      <section className="hero">
        <Photo src={images.hero} className="hero__bg" eager />
        <div className="hero__overlay" />
        <div className="container hero__content">
          <p className="eyebrow eyebrow--light">
            <Bolt className="eyebrow__bolt" />
            楊梅・小班制肌力訓練工作室
          </p>
          <h1 className="hero__title">
            即刻行動，
            <br />
            變得更強。
          </h1>
          <p className="hero__lead">
            一位教練、最多兩位學員。用專注的小班制訓練，幫你建立力量、改善體態，養成真正持久的運動習慣。
          </p>
          <div className="hero__actions">
            <Button to="/booking" size="lg" arrow>
              立即預約
            </Button>
            <Button to="/classes" size="lg" variant="outline-light">
              了解課程
            </Button>
          </div>
          <ul className="hero__facts">
            <li>
              <strong>1 : 1–2</strong>
              <span>師生比例</span>
            </li>
            <li>
              <strong>60 分鐘</strong>
              <span>每堂課程</span>
            </li>
            <li>
              <strong>每週固定</strong>
              <span>專屬時段</span>
            </li>
            <li>
              <strong>
                {studioInfo.rating.score} <span className="hero__star">★</span>
              </strong>
              <span>Google 評價（{studioInfo.rating.count} 則）</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="split__media">
            <Photo src={images.studio} alt="即動 ACTION GYM 訓練空間" className="rounded-xl tall" />
            <div className="floating-note">
              <Bolt className="floating-note__bolt" />
              <p>
                <strong>全預約制</strong>
                每個時段只服務一組學員
              </p>
            </div>
          </div>
          <div className="split__text">
            <SectionHeading eyebrow="關於即動" title="不是大型健身房，是你的專屬訓練基地。">
              即動 ACTION GYM 是一間只有一位教練的小型工作室。沒有擁擠的器材區、沒有推銷，只有一個安靜的空間，和一位真正記得你身體狀況的教練。
            </SectionHeading>
            <p className="body-text">
              我們相信「即刻行動」比完美計畫更重要。不論你是第一次接觸重量訓練，還是想突破停滯期，都可以從一堂體驗課開始，找到屬於你的節奏。
            </p>
            <Button to="/about" variant="secondary" arrow>
              認識我們
            </Button>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-top">
            <SectionHeading eyebrow="課程方案" title="一個人練，或找夥伴一起。">
              所有課程皆由同一位教練親自指導，依人數選擇最適合你的方式。
            </SectionHeading>
            <Button to="/classes" variant="ghost" arrow>
              查看全部方案
            </Button>
          </div>
          <div className="card-grid card-grid--3">
            {plans.map((plan) => (
              <ClassCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="為什麼選擇小班制" title="少一點人，多一點進步。" align="center" />
          <div className="benefits">
            {benefits.map((b) => (
              <article key={b.title} className="benefit">
                <span className="benefit__icon">
                  <Icon name={b.icon} size={24} />
                </span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <SectionHeading eyebrow="你的教練" title="從第一堂課開始，都是同一位教練。" light />
          <CoachCard />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="上課流程" title="四個步驟，開始訓練。" />
          <ol className="process">
            {process.map((p, i) => (
              <li key={p.title} className="process__item">
                <span className="process__num">0{i + 1}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cta">
        <Photo src={images.dark} className="cta__bg" />
        <div className="cta__overlay" />
        <div className="container cta__content">
          <Bolt className="cta__bolt" />
          <h2>準備好開始你的訓練了嗎？</h2>
          <p>第一次來的朋友，推薦從體驗課開始。教練會先了解你的需求，再一起規劃接下來的訓練。</p>
          <div className="cta__actions">
            <Button to="/booking/trial" size="lg" arrow>
              預約第一堂課
            </Button>
            <Button to="/schedule" size="lg" variant="outline-light">
              查看課表
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
