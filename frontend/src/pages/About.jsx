import Button from '../components/Button'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Photo from '../components/Photo'
import SectionHeading from '../components/SectionHeading'
import { images } from '../data/images'

const values = [
  { title: '動作品質優先', text: '重量可以慢慢加，但動作不能將就。正確的發力模式，是長期進步與避免受傷的基礎。' },
  { title: '漸進，而且持續', text: '不追求一次練到爆，而是每週穩定累積。固定時段上課，就是讓訓練變成習慣。' },
  { title: '因人而異', text: '同樣是深蹲，每個人的身體結構、柔軟度和舊傷都不同。課表永遠依你調整。' },
]

const equipment = [
  '深蹲架 × 2 與奧林匹克槓',
  '可調式啞鈴 2.5–40 kg',
  '壺鈴、彈力帶、TRX 懸吊',
  'Cable 滑輪訓練機',
  '划船機與風扇車',
  '獨立淋浴間與置物櫃',
]

const approach = [
  { step: '評估', text: '動作檢測、體態評估、了解生活習慣與目標。' },
  { step: '規劃', text: '依評估結果設計 4 週為一期的週期化課表。' },
  { step: '執行', text: '每堂課教練全程指導，即時調整強度與動作。' },
  { step: '回顧', text: '每期結束重新檢測，用數據檢視進步並調整方向。' },
]

export default function About() {
  return (
    <>
      <PageHeader eyebrow="About Us" title="關於即動">
        一間小小的工作室，一位教練，和一群每週準時報到的學員。
      </PageHeader>

      <section className="section">
        <div className="container split">
          <div className="split__text">
            <SectionHeading eyebrow="品牌故事" title="「即動」，就是現在開始動。" />
            <p className="body-text">
              很多人想運動，卻總在等「準備好」的那一天：等工作不忙、等天氣變好、等下個月。即動這個名字，來自我們最想對每位學員說的話——不用等，現在就開始。
            </p>
            <p className="body-text">
              我們刻意把工作室維持在最小的規模：只有一位教練，每個時段只服務一組學員。這讓我們能真正記住每個人的狀況，也讓每一堂課都有足夠的專注力。
            </p>
          </div>
          <div className="split__media">
            <Photo src={images.rack} alt="訓練中的學員" className="rounded-xl tall" />
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <SectionHeading eyebrow="訓練理念" title="我們相信的三件事" align="center" />
          <div className="values">
            {values.map((v, i) => (
              <article key={v.title} className="value">
                <span className="value__num">0{i + 1}</span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="gallery">
            <Photo src={images.dumbbells} alt="啞鈴區" className="gallery__a" />
            <Photo src={images.squat} alt="深蹲架" className="gallery__b" />
            <Photo src={images.tools} alt="訓練小工具" className="gallery__c" />
          </div>
          <div className="split split--top">
            <SectionHeading eyebrow="空間環境" title="不大，但該有的都有。">
              位於楊梅光華街的獨立空間，全預約制，不用排隊等器材，也不用在意旁人的眼光。
            </SectionHeading>
            <ul className="check-list">
              {equipment.map((e) => (
                <li key={e}>
                  <Icon name="check" size={18} strokeWidth={2.4} />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <SectionHeading eyebrow="訓練方式" title="有系統的訓練，才會有穩定的進步。" light>
            每 4 週為一個訓練週期，從評估到回顧，讓每一堂課都有明確的目的。
          </SectionHeading>
          <ol className="approach">
            {approach.map((a, i) => (
              <li key={a.step}>
                <span className="approach__num">{i + 1}</span>
                <h3>{a.step}</h3>
                <p>{a.text}</p>
              </li>
            ))}
          </ol>
          <div className="center-actions">
            <Button to="/booking/trial" size="lg" arrow>
              預約體驗課
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
