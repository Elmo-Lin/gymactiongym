import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import SectionHeading from '../components/SectionHeading'
import { corporatePlan, getPlan, trainingGoals } from '../data/classes'
import { studioInfo } from '../data/schedule'
import { formatPrice } from '../utils/booking'

const solo = getPlan('one-on-one')
const duo = getPlan('one-on-two')

// 價目表標題旁的連結，連到方案介紹頁（課程內容、適合對象）
function PlanLink({ plan }) {
  return (
    <Link to={`/classes/${plan.id}`} className="link-arrow price-table__link">
      課程介紹
      <Icon name="arrow" size={16} />
    </Link>
  )
}

export default function Classes() {
  return (
    <>
      <PageHeader eyebrow="Programs" title="課程方案">
        所有課程皆為 60 分鐘，由同一位教練親自指導。線上預約只保留時段，套票方案於現場購買，堂數越多平均單堂越划算。
      </PageHeader>

      {/* id="pricing"：首頁方案卡片上的價格會連到這裡 */}
      <section id="pricing" className="section section--snug section--anchor">
        <div className="container">
          <Link to="/classes/trial" className="link-arrow pricing-trial">
            <span className="badge badge--trial">體驗</span>
            第一次來？首次體驗課免費
            <Icon name="arrow" size={16} />
          </Link>

          <h3 className="price-table__title">
            {solo.name}
            <PlanLink plan={solo} />
          </h3>
          <div className="table-wrap">
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">方案</th>
                  <th scope="col">堂數</th>
                  <th scope="col">平均單堂</th>
                  <th scope="col">總價</th>
                  <th scope="col">
                    平均單堂<small>續約會員</small>
                  </th>
                  <th scope="col">
                    總價<small>續約會員</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* data-label：手機版表格會變成卡片，用它顯示每個欄位的名稱 */}
                {solo.packages.map((p) => (
                  <tr key={p.name}>
                    <th scope="row">{p.name}</th>
                    <td data-label="堂數">{p.sessions}</td>
                    <td data-label="平均單堂">{formatPrice(p.perSession)}</td>
                    <td data-label="總價">{formatPrice(p.perSession * p.sessions)}</td>
                    {p.renewal ? (
                      <>
                        <td data-label="續約會員・平均單堂">{formatPrice(p.renewal)}</td>
                        <td data-label="續約會員・總價">{formatPrice(p.renewal * p.sessions)}</td>
                      </>
                    ) : (
                      <>
                        <td className="compare__empty">—</td>
                        <td className="compare__empty">—</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="price-grid">
            <div>
              <h3 className="price-table__title">
                {duo.name}
                <small>每位學員的價格</small>
                <PlanLink plan={duo} />
              </h3>
              <div className="table-wrap">
                <table className="compare compare--compact">
                  <thead>
                    <tr>
                      <th scope="col">期班</th>
                      <th scope="col">平均單堂</th>
                      <th scope="col">總價</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duo.packages.map((p) => (
                      <tr key={p.name}>
                        <th scope="row">{p.name}</th>
                        <td data-label="平均單堂">{formatPrice(p.perSession)}</td>
                        <td data-label="總價">{formatPrice(p.perSession * p.sessions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 className="price-table__title">
                {corporatePlan.name}
                <small>{corporatePlan.note}</small>
              </h3>
              <div className="table-wrap">
                <table className="compare compare--compact">
                  <thead>
                    <tr>
                      <th scope="col">報名人數</th>
                      <th scope="col">每位每堂</th>
                    </tr>
                  </thead>
                  <tbody>
                    {corporatePlan.tiers.map((t) => (
                      <tr key={t.people}>
                        <th scope="row">{t.people} 人</th>
                        <td data-label="每位每堂">{formatPrice(t.perPerson)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <p className="footnote">
            ＊價格以現場公告為準。每個時段只服務一組學員，1對2 請和自己的朋友一起報名；企業包班不開放線上預約，請透過 LINE {studioInfo.line} 洽詢。
          </p>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <SectionHeading eyebrow="訓練目標" title="不論你的目標是什麼，課表都為你量身設計。" />
          <div className="goals">
            {trainingGoals.map((g) => (
              <article key={g.id} className="goal">
                <h3>{g.label}</h3>
                <p>{g.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
