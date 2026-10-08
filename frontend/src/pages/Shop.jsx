import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import { useCart } from '../context/cart'
import { brands, productCategories, productSeries } from '../data/products'
import { formatPrice } from '../utils/booking'

function Sweetness({ level }) {
  if (!level) return null
  return (
    <span className="sweetness" aria-label={`甜度 ${level} 顆星`} title={`甜度 ${level}／5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < level ? 'is-on' : ''} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  )
}

function BrandLogo({ brand }) {
  return (
    <span className={`brand-logo ${brand.dark ? 'brand-logo--dark' : ''}`}>
      <img src={brand.logo} alt={brand.name} />
    </span>
  )
}

function ProductRow({ product }) {
  const { add } = useCart()
  const [option, setOption] = useState(product.options[0].label)
  const [added, setAdded] = useState(false)
  const timer = useRef()
  const price = product.options.find((o) => o.label === option).price

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleAdd = () => {
    add(product.id, option)
    setAdded(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(false), 1400)
  }

  return (
    <li className="product">
      <div className="product__info">
        <h4 className="product__name">
          {product.name}
          {product.hot && <span className="product__hot">HOT</span>}
        </h4>
        <div className="product__meta">
          <Sweetness level={product.sweetness} />
          {product.diet && <span className="product__tag">{product.diet}</span>}
          {product.note && <span className="product__note">{product.note}</span>}
        </div>
      </div>

      <div className="product__buy">
        {product.options.length > 1 ? (
          <div className="size-toggle" role="radiogroup" aria-label={`${product.name} 規格`}>
            {product.options.map((o) => (
              <button
                key={o.label}
                type="button"
                role="radio"
                aria-checked={option === o.label}
                className={option === o.label ? 'is-active' : ''}
                onClick={() => setOption(o.label)}
              >
                {o.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="product__size">{option}</span>
        )}
        <strong className="product__price">{formatPrice(price)}</strong>
        <button
          type="button"
          className={`add-btn ${added ? 'add-btn--done' : ''}`}
          onClick={handleAdd}
          aria-label={`將 ${product.name}（${option}）加入購物車`}
        >
          <Icon name={added ? 'check' : 'plus'} size={18} strokeWidth={2.4} />
          <span>{added ? '已加入' : '加入'}</span>
        </button>
      </div>
    </li>
  )
}

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const { count, total } = useCart()
  const requested = params.get('cat')
  const filter = productCategories.some((c) => c.value === requested) ? requested : 'all'
  const visible = filter === 'all' ? productSeries : productSeries.filter((s) => s.category === filter)

  const selectFilter = (value) => {
    setParams(value === 'all' ? {} : { cat: value }, { replace: true })
  }

  return (
    <>
      <PageHeader eyebrow="Nutrition" title="營養補給">
        練完記得補充！工作室代售果果能量 GOpower 與 PlantsB 彼蛋白系列商品。線上加入購物車送出訂單，下次上課到店取貨付款。
      </PageHeader>

      <section className="section shop">
        <div className="container">
          <div className="filters" role="tablist" aria-label="依商品類別篩選">
            {productCategories.map((c) => (
              <button
                key={c.value}
                type="button"
                role="tab"
                aria-selected={filter === c.value}
                className={`chip ${filter === c.value ? 'chip--active' : ''}`}
                onClick={() => selectFilter(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="series-list">
            {visible.map((series) => (
              <article key={series.id} className="series">
                <header className="series__head">
                  <div className="series__heading">
                    <p className="series__en">{series.en}</p>
                    <h3 className="series__title">{series.name}</h3>
                    <p className="series__desc">{series.desc}</p>
                  </div>
                  <BrandLogo brand={brands[series.brand]} />
                </header>
                <ul className="product-list">
                  {series.products.map((product) => (
                    <ProductRow key={product.id} product={product} />
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <p className="footnote">
            ＊價格依店內價目表，實際以現場為準。★ 為甜度標示，HOT 為人氣熱銷品項。部分口味數量有限，教練確認訂單時會告知是否有現貨。
          </p>
        </div>
      </section>

      {count > 0 && (
        <div className="cart-bar" role="status">
          <div className="container cart-bar__inner">
            <p>
              <Icon name="cart" size={20} />
              購物車 <strong>{count}</strong> 件・{formatPrice(total)}
            </p>
            <Button to="/cart" size="sm" arrow>
              前往結帳
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
