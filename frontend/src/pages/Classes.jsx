import { useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import ClassCard from '../components/ClassCard'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import SectionHeading from '../components/SectionHeading'
import { formatFilters, plans, trainingGoals, weeklyPackages } from '../data/classes'
import { formatPrice } from '../utils/booking'

const groupPlans = plans.filter((p) => p.id !== 'trial')

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
          <SectionHeading eyebrow="價格比較" title="方案與費用一覽">
            固定每週時段上課，8 週享 95 折、12 週享 9 折。
          </SectionHeading>
          <div className="table-wrap">
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">方案</th>
                  <th scope="col">每人每堂</th>
                  <th scope="col">每堂總費用</th>
                  {weeklyPackages.map((p) => (
                    <th scope="col" key={p.weeks}>
                      {p.label}
                      <small>{p.note}・每人</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupPlans.map((plan) => (
                  <tr key={plan.id}>
                    <th scope="row">{plan.name}</th>
                    <td>{formatPrice(plan.price)}</td>
                    <td>{formatPrice(plan.price * plan.capacity)}</td>
                    {weeklyPackages.map((p) => (
                      <td key={p.weeks}>{formatPrice(Math.round(plan.price * p.weeks * p.discount))}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="footnote">＊首次體驗課 {formatPrice(plans[0].price)}，限單人、單次預約。每個時段只服務一組學員，1對2 請和自己的朋友一起報名。</p>
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
