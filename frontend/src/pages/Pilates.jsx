import { Link } from 'react-router-dom'
import Button from '../components/Button'
import ClassCard from '../components/ClassCard'
import Icon from '../components/Icon'
import Photo from '../components/Photo'
import SectionHeading from '../components/SectionHeading'
import { peopleLabel, plansFor } from '../data/classes'
import { pilates, pilatesCoach } from '../data/pilates'
import { planPath } from '../data/programs'
import { formatPrice } from '../utils/booking'

const pilatesPlans = plansFor('pilates')

// 皮拉提斯的課程方案頁（/pilates）：介紹、方案與價目表、器械、教室環境
export default function Pilates() {
  const [hero, ...gallery] = pilates.gallery

  return (
    <>
      <section className="detail-hero">
        <Photo src={hero.src} alt={hero.alt} className="detail-hero__bg" eager />
        <div className="detail-hero__overlay" />
        <div className="container detail-hero__content">
          <span className="badge badge--pilates">Pilates</span>
          <h1>皮拉提斯課程方案</h1>
          <p>{pilates.tagline}</p>
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <div>
            <h2 className="detail__heading">{pilates.name}</h2>
            <p className="lead">{pilates.description}</p>
            <p className="body-text">
              由
              <Link to="/pilates/coach" className="inline-link">
                {pilatesCoach.name}
              </Link>
              授課，每堂 60 分鐘。每個時段只服務一組學員，可以一個人上，也可以自己揪朋友一起來。
            </p>
          </div>
          <div>
            <h2 className="detail__heading">適合對象</h2>
            <ul className="check-list">
              {pilates.suitable.map((s) => (
                <li key={s}>
                  <Icon name="check" size={18} strokeWidth={2.4} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <SectionHeading eyebrow="課程方案" title="一個人練、兩人同行，或揪團一起上。" />
          <div className="card-grid card-grid--3">
            {pilatesPlans.map((plan) => (
              <ClassCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* id="pricing"：方案卡片上的價格會連到這裡 */}
      <section id="pricing" className="section section--anchor">
        <div className="container">
          <h2 className="price-table__title">皮拉提斯價目表</h2>
          <div className="table-wrap">
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">方案</th>
                  <th scope="col">人數</th>
                  <th scope="col">單堂</th>
                  <th scope="col">8 堂優惠價</th>
                  <th scope="col">
                    平均單堂<small>8 堂優惠</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* data-label：手機版表格會變成卡片，用它顯示每個欄位的名稱 */}
                {pilatesPlans.map((plan) => {
                  const single = plan.packages.find((p) => p.sessions === 1)
                  const bundle = plan.packages.find((p) => p.sessions > 1)
                  const each = plan.capacity > 1 ? '／位' : ''
                  return (
                    <tr key={plan.id}>
                      <th scope="row">
                        <Link to={planPath(plan)} className="inline-link">
                          {plan.name}
                        </Link>
                      </th>
                      <td data-label="人數">{peopleLabel(plan)} 人</td>
                      <td data-label="單堂">
                        {formatPrice(single.perSession)}
                        {each}
                      </td>
                      <td data-label="8 堂優惠價">
                        {formatPrice(bundle.perSession * bundle.sessions)}
                        {each}
                      </td>
                      <td data-label="平均單堂">
                        {formatPrice(bundle.perSession)}
                        {each}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="footnote">＊價格以現場公告為準。1對2 與團課為每位學員的價格。線上預約只保留時段，套票方案於現場購買。</p>
          <div className="center-actions">
            <Button to="/booking?program=pilates" size="lg" arrow>
              預約皮拉提斯
            </Button>
            <Button to="/pilates/schedule" size="lg" variant="secondary">
              查看皮拉提斯課表
            </Button>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <SectionHeading eyebrow="使用器械" title="專屬教室，器械齊全。" />
          <div className="equipment">
            {pilates.equipment.map((e) => (
              <article key={e.name} className="equipment__item">
                <Photo src={e.photo} alt={e.name} className="equipment__photo" />
                <h3>{e.name}</h3>
                <p>{e.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="教室環境" title="明亮安靜，專心感受身體。" />
          <div className="gallery">
            {gallery.map((g) => (
              <Photo key={g.src} src={g.src} alt={g.alt} className="gallery__photo" />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
