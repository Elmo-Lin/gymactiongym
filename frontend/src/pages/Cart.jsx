import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { MAX_QTY, useCart } from '../context/cart'
import { formatPrice, generateReference } from '../utils/booking'
import { saveOrder } from '../utils/storage'
import { normalizePhone } from '../utils/validation'

const PHONE_RE = /^09\d{8}$/

const validate = (form) => {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = '請輸入姓名（至少 2 個字）'
  if (!PHONE_RE.test(normalizePhone(form.phone))) errors.phone = '請輸入 09 開頭的 10 碼手機號碼'
  return errors
}

function QtyStepper({ line }) {
  const { setQty } = useCart()
  const update = (qty) => setQty(line.productId, line.option, qty)

  return (
    <div className="qty" aria-label={`${line.product.name} 數量`}>
      <button type="button" onClick={() => update(line.qty - 1)} disabled={line.qty <= 1} aria-label="減少數量">
        <Icon name="minus" size={16} strokeWidth={2.2} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_QTY}
        value={line.qty}
        onChange={(e) => update(Number(e.target.value))}
        aria-label="數量"
      />
      <button type="button" onClick={() => update(line.qty + 1)} disabled={line.qty >= MAX_QTY} aria-label="增加數量">
        <Icon name="plus" size={16} strokeWidth={2.2} />
      </button>
    </div>
  )
}

export default function Cart() {
  const { lines, count, total, remove, clear } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', note: '' })
  const [touched, setTouched] = useState({})
  const errors = validate(form)
  const show = (key) => (touched[key] ? errors[key] : undefined)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  if (lines.length === 0) {
    return (
      <section className="section">
        <div className="container empty empty--page">
          <Icon name="cart" size={36} />
          <h1>購物車是空的</h1>
          <p>到營養補給頁挑選乳清、肌酸或蛋白點心吧！</p>
          <Button to="/shop" arrow>
            逛逛商品
          </Button>
        </div>
      </section>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (Object.keys(errors).length > 0) {
      setTouched({ name: true, phone: true })
      return
    }
    const order = {
      reference: generateReference().replace(/^AG/, 'OD'),
      createdAt: new Date().toISOString(),
      contact: { name: form.name.trim(), phone: normalizePhone(form.phone), note: form.note.trim() },
      items: lines.map((l) => ({
        productId: l.productId,
        name: l.product.name,
        seriesName: l.product.seriesName,
        option: l.option,
        price: l.price,
        qty: l.qty,
      })),
      total,
    }
    saveOrder(order)
    clear()
    navigate(`/cart/confirmation?ref=${order.reference}`)
  }

  return (
    <section className="booking cart">
      <div className="container">
        <div className="cart__top">
          <h1>購物車</h1>
          <Link to="/shop" className="link-arrow">
            <Icon name="arrowLeft" size={16} />
            繼續選購
          </Link>
        </div>

        <div className="booking__layout">
          <div className="cart__main">
            <ul className="cart-lines">
              {lines.map((line) => (
                <li key={line.key} className="cart-line">
                  <div className="cart-line__info">
                    <p className="cart-line__series">{line.product.seriesName}</p>
                    <h2 className="cart-line__name">{line.product.name}</h2>
                    <p className="cart-line__option">
                      {line.option}・{formatPrice(line.price)}
                    </p>
                  </div>
                  <QtyStepper line={line} />
                  <strong className="cart-line__subtotal">{formatPrice(line.subtotal)}</strong>
                  <button
                    type="button"
                    className="cart-line__remove"
                    onClick={() => remove(line.productId, line.option)}
                    aria-label={`移除 ${line.product.name}（${line.option}）`}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </li>
              ))}
            </ul>

            <form className="cart-form" onSubmit={handleSubmit} noValidate id="checkout">
              <h2 className="step-panel__title">取貨資料</h2>
              <p className="step-panel__lead">送出後教練會確認庫存並與你聯絡，商品於到店上課時取貨、現場付款（現金或轉帳）。</p>
              <div className="form-grid">
                <div className={`field ${show('name') ? 'field--error' : ''}`}>
                  <label htmlFor="order-name">
                    姓名<span className="field__req">*</span>
                  </label>
                  <input
                    id="order-name"
                    type="text"
                    autoComplete="name"
                    placeholder="王小明"
                    value={form.name}
                    onChange={set('name')}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    aria-invalid={Boolean(show('name'))}
                    aria-describedby={show('name') ? 'order-name-error' : undefined}
                  />
                  {show('name') && (
                    <p className="field__error" id="order-name-error" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className={`field ${show('phone') ? 'field--error' : ''}`}>
                  <label htmlFor="order-phone">
                    手機號碼<span className="field__req">*</span>
                  </label>
                  <input
                    id="order-phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="0912-345-678"
                    value={form.phone}
                    onChange={set('phone')}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    aria-invalid={Boolean(show('phone'))}
                    aria-describedby={show('phone') ? 'order-phone-error' : undefined}
                  />
                  {show('phone') && (
                    <p className="field__error" id="order-phone-error" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div className="field form-grid__full">
                  <label htmlFor="order-note">備註</label>
                  <textarea
                    id="order-note"
                    rows={3}
                    value={form.note}
                    onChange={set('note')}
                    placeholder="例如：預計取貨日期、想詢問的口味"
                  />
                </div>
              </div>
            </form>
          </div>

          <aside className="booking__aside">
            <div className="summary-card summary-card--sticky">
              <h2 className="summary-card__title">訂單摘要</h2>
              <dl className="order-sum">
                <div>
                  <dt>商品數量</dt>
                  <dd>{count} 件</dd>
                </div>
                <div>
                  <dt>取貨方式</dt>
                  <dd>到店取貨</dd>
                </div>
                <div>
                  <dt>付款方式</dt>
                  <dd>取貨時付款</dd>
                </div>
              </dl>
              <div className="summary-total">
                <span>合計</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <Button type="submit" form="checkout" size="lg" block arrow className="order-submit">
                送出訂單
              </Button>
              <p className="summary-card__note">
                <button type="button" className="text-btn" onClick={clear}>
                  清空購物車
                </button>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
