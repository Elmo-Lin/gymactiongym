import { Link } from 'react-router-dom'
import Button from '../components/Button'
import ClassCard from '../components/ClassCard'
import CoachCard from '../components/CoachCard'
import Icon from '../components/Icon'
import { Bolt } from '../components/Logo'
import Photo from '../components/Photo'
import SectionHeading from '../components/SectionHeading'
import { plansFor, startingPrice } from '../data/classes'
import { images } from '../data/images'
import { pilates, pilatesCoach } from '../data/pilates'
import { programs } from '../data/programs'
import { formatPrice } from '../utils/booking'

// 「兩種課程」區塊：健身與皮拉提斯並排介紹
const programCards = [
  {
    program: programs.fitness,
    photo: images.studio,
    alt: '即動 ACTION GYM 肌力訓練空間',
    title: '小班制肌力訓練',
    text: '深蹲、硬舉、臥推等自由重量訓練，從動作檢測開始，循序漸進增肌、減脂、改善體態。',
    formats: '首次體驗課・1對1・1對2',
  },
  {
    program: programs.pilates,
    photo: pilates.gallery[0].src,
    alt: pilates.gallery[0].alt,
    title: pilates.name,
    text: '在專屬教室使用 Reformer、Cadillac、Chair 等器械，練核心穩定、改善久坐痠痛與體態。',
    formats: '1對1・1對2・2–4 人團課',
  },
]

// 各類別最便宜的平均單堂價（不含免費體驗課）
const lowestPrice = (program) => Math.min(...plansFor(program).filter((p) => !p.free).map(startingPrice))

const benefits = [
  {
    icon: 'target',
    title: '專屬的動作指導',
    text: '每個時段只服務一組學員，每一組、每一下教練都看得到，動作錯了當下就修正。',
  },
  {
    icon: 'repeat',
    title: '固定時段好堅持',
    text: '每週同一時間上課，把運動排進生活。和朋友約好一起練，也會讓你更不想缺席。',
  },
  {
    icon: 'users',
    title: '和朋友一起更划算',
    text: '1對2 或皮拉提斯 2–4 人團課，和朋友分攤費用，享有私教品質，卻是更親民的價格。',
  },
  {
    icon: 'shield',
    title: '安全、有效、看得見',
    text: '從身體評估開始，循序漸進調整重量與彈簧阻力；定期重新評估，進步看得見。',
  },
]

const process = [
  { title: '選擇課程', text: '想變強壯選健身，想練核心與體態選皮拉提斯，兩種也可以搭配著上。' },
  { title: '選擇上課方式', text: '一個人、和朋友兩個人，或皮拉提斯揪 2–4 人團課。' },
  { title: '固定每週時段', text: '線上預約空堂，鎖定每週固定時間，教練為你保留專屬時段。' },
  { title: '持續追蹤進步', text: '定期重新評估，依進度調整課表、重量與器械阻力。' },
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
            楊梅・小班制肌力訓練 × 器械皮拉提斯
          </p>
          <h1 className="hero__title">
            即刻行動，
            <br />
            變得更強。
          </h1>
          <p className="hero__lead">
            小班制肌力訓練與器械皮拉提斯，每個時段只服務一組學員。幫你建立力量、改善體態，養成真正持久的運動習慣。
          </p>
          <div className="hero__actions">
            <Button to="/booking" size="lg" arrow>
              立即預約
            </Button>
            <Button to="/classes" size="lg" variant="outline-light">
              健身課程
            </Button>
            <Button to="/pilates" size="lg" variant="outline-light">
              皮拉提斯
            </Button>
          </div>
        </div>
      </section>

      <section className="bleed-split">
        <div className="bleed-split__media">
          <Photo src={images.studio} alt="即動 ACTION GYM 訓練空間" className="bleed-split__photo" />
        </div>
        <div className="bleed-split__text split__text">
          <SectionHeading
            eyebrow="關於即動"
            title={
              <>
                不是大型健身房，
                <br />
                是你的專屬訓練基地。
              </>
            }
          >
            即動 ACTION GYM 是一間小型工作室，有肌力訓練與器械皮拉提斯兩間教室，各由一位教練負責。沒有擁擠的器材區、沒有推銷，只有安靜的空間，和真正記得你身體狀況的教練。
          </SectionHeading>
          <p className="body-text">
            我們相信「即刻行動」比完美計畫更重要。不論你是第一次接觸重量訓練、想用皮拉提斯改善體態，還是想突破停滯期，都可以從一堂課開始，找到屬於你的節奏。
          </p>
          <p className="split__note">
            <Bolt className="split__note-bolt" />
            <strong>全預約制</strong>
            <span>每個時段只服務一組學員</span>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="兩種課程" title="變強壯，或練出穩定的核心。" align="center">
            兩間教室、兩位教練，時段各自獨立。依你的目標選擇，也可以兩種搭配著上。
          </SectionHeading>
          <div className="program-cards">
            {programCards.map(({ program, photo, alt, title, text, formats }) => (
              <article key={program.id} className="program-card">
                <Link to={program.classesPath} className="program-card__media" tabIndex={-1} aria-hidden="true">
                  <Photo src={photo} alt={alt} className={`program-card__photo ${program.id === 'pilates' ? 'pilates-hero__photo' : ''}`} />
                </Link>
                <div className="program-card__body">
                  <span className={`badge badge--${program.id === 'pilates' ? 'pilates' : 'trial'}`}>{program.name}</span>
                  <h3>
                    <Link to={program.classesPath}>{title}</Link>
                  </h3>
                  <p>{text}</p>
                  <dl className="program-card__facts">
                    <div>
                      <dt>教練</dt>
                      <dd>{program.coach.name}</dd>
                    </div>
                    <div>
                      <dt>上課方式</dt>
                      <dd>{formats}</dd>
                    </div>
                    <div>
                      <dt>平均單堂</dt>
                      <dd>{formatPrice(lowestPrice(program.id))} 起</dd>
                    </div>
                  </dl>
                  <div className="program-card__actions">
                    <Button to={program.classesPath} size="sm" arrow>
                      課程方案
                    </Button>
                    <Button to={program.schedulePath} size="sm" variant="secondary">
                      課表
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-top">
            <SectionHeading eyebrow="健身課程" title="一個人練，或找夥伴一起。">
              肌力訓練由石頭教練親自指導，依人數選擇最適合你的方式。
            </SectionHeading>
            <Button to="/classes" variant="ghost" arrow>
              查看健身方案
            </Button>
          </div>
          <div className="card-grid card-grid--3">
            {plansFor('fitness').map((plan) => (
              <ClassCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint section--flush-top">
        <div className="container">
          <div className="section-top">
            <SectionHeading eyebrow="皮拉提斯課程" title="一個人練、兩人同行，或揪團一起上。">
              器械皮拉提斯由{pilatesCoach.name}指導，在專屬教室上課。
            </SectionHeading>
            <Button to="/pilates" variant="ghost" arrow>
              查看皮拉提斯方案
            </Button>
          </div>
          <div className="card-grid card-grid--3">
            {plansFor('pilates').map((plan) => (
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
          <SectionHeading
            eyebrow="你的教練"
            title={
              <>
                從第一堂課開始，
                <br />
                都是同一位教練。
              </>
            }
            light
          />
          <div className="coach-cards">
            <CoachCard />
            <CoachCard person={pilatesCoach} to="/pilates/coach" />
          </div>
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
          <p>第一次來的朋友，健身推薦從免費體驗課開始；皮拉提斯可以從 1對1 開始，讓教練先了解你的身體狀況。</p>
          <div className="cta__actions">
            <Button to="/booking" size="lg" arrow>
              預約第一堂課
            </Button>
            <Button to="/schedule" size="lg" variant="outline-light">
              健身課表
            </Button>
            <Button to="/pilates/schedule" size="lg" variant="outline-light">
              皮拉提斯課表
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
