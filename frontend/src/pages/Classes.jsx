import { useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import ClassCard from '../components/ClassCard'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import SectionHeading from '../components/SectionHeading'
import { corporatePlan, formatFilters, getPlan, plans, trainingGoals } from '../data/classes'
import { studioInfo } from '../data/schedule'
import { formatPrice } from '../utils/booking'

const solo = getPlan('one-on-one')
const duo = getPlan('one-on-two')

export default function Classes() {
  const [params, setParams] = useSearchParams()
  const requested = params.get('type')
  const filter = formatFilters.some((f) => f.value === requested) ? requested : 'all'
  const visible = filter === 'all' ? plans : plans.filter((p) => p.format === filter)

  const selectFilter = (value) => {
    setParams(value === 'all' ? {} : { type: value }, { replace: true })
  }

  return (
    <>
      <PageHeader eyebrow="Programs" title="課程方案">
        所有課程皆為 60 分鐘、由同一位教練親自指導。依上課人數選擇方案，人數越多、每人費用越實惠。
      </PageHeader>

      <section className="section">
        <div className="container">
          <div className="filters" role="tablist" aria-label="依上課人數篩選">
            {formatFilters.map((f) => (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={filter === f.value}
                className={`chip ${filter === f.value ? 'chip--active' : ''}`}
                onClick={() => selectFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {visible.length > 0 ? (
            <div className="card-grid card-grid--3">
              {visible.map((plan) => (
                <ClassCard key={plan.id} plan={plan} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <Icon name="dumbbell" size={32} />
              <h3>目前沒有符合條件的方案</h3>
              <p>試試其他篩選條件，或直接查看全部方案。</p>
              <Button variant="secondary" onClick={() => selectFilter('all')}>
                顯示全部
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <SectionHeading eyebrow="價目表" title="方案與費用一覽">
            首次體驗課免費。線上預約只保留時段，套票方案於現場購買，堂數越多平均單堂越划算。
          </SectionHeading>

          <h3 className="price-table__title">{solo.name}</h3>
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
                {solo.packages.map((p) => (
                  <tr key={p.name}>
                    <th scope="row">{p.name}</th>
                    <td>{p.sessions}</td>
                    <td>{formatPrice(p.perSession)}</td>
                    <td>{formatPrice(p.perSession * p.sessions)}</td>
                    <td>{p.renewal ? formatPrice(p.renewal) : '—'}</td>
                    <td>{p.renewal ? formatPrice(p.renewal * p.sessions) : '—'}</td>
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
                        <td>{formatPrice(p.perSession)}</td>
                        <td>{formatPrice(p.perSession * p.sessions)}</td>
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
                        <td>{formatPrice(t.perPerson)}</td>
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

      <section className="section">
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
