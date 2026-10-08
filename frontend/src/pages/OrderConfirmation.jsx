import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { studioInfo } from '../data/schedule'
import { getOrder } from '../services/orders'
import { formatPrice } from '../utils/booking'

export default function OrderConfirmation() {
  const [params] = useSearchParams()
  const ref = params.get('ref')
  const [result, setResult] = useState({ status: 'loading', order: null })

  useEffect(() => {
    let ignore = false
    getOrder(ref)
      .then((order) => !ignore && setResult({ status: 'done', order }))
      .catch(() => !ignore && setResult({ status: 'error', order: null }))
    return () => {
      ignore = true
    }
  }, [ref])

  const { status, order } = result

  if (status === 'loading') {
    return (
      <section className="booking">
        <div className="container empty empty--page">
          <Icon name="cart" size={36} />
          <h1>讀取訂單中…</h1>
        </div>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="booking">
        <div className="container empty empty--page">
          <Icon name="cart" size={36} />
          <h1>暫時無法讀取訂單</h1>
          <p>請稍後重新整理頁面，或透過 LINE {studioInfo.line} 與我們確認訂單。</p>
          <Button to="/shop" arrow>
            回到營養補給
          </Button>
        </div>
      </section>
    )
  }

  if (!order) {
    return (
      <section className="booking">
        <div className="container empty empty--page">
          <Icon name="cart" size={36} />
          <h1>找不到訂單紀錄</h1>
          <p>這個訂單編號不存在，請確認網址是否正確。</p>
          <Button to="/shop" arrow>
            回到營養補給
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="booking">
      <div className="container confirmation">
        <div className="confirmation__hero">
          <span className="confirmation__icon">
            <Icon name="check" size={36} strokeWidth={2.6} />
          </span>
          <h1>訂單已送出！</h1>
          <p>{order.contact.name} 你好，教練確認庫存後會透過電話或 LINE 與你聯絡，商品於到店時取貨付款。</p>
          <div className="reference">
            <span>訂單編號</span>
            <strong>{order.reference}</strong>
          </div>
        </div>

        <div className="summary-card">
          <ul className="order-items">
            {order.items.map((item) => (
              <li key={`${item.productId}|${item.option}`}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.seriesName}・{item.option} × {item.qty}
                  </span>
                </div>
                <span>{formatPrice(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-total">
            <span>合計（取貨時付款）</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
        </div>

        <div className="next-steps">
          <h2>取貨小提醒</h2>
          <ul className="check-list">
            <li>
              <Icon name="check" size={18} strokeWidth={2.4} />
              取貨時請告知訂單編號，可使用現金或轉帳付款
            </li>
            <li>
              <Icon name="check" size={18} strokeWidth={2.4} />
              如需修改或取消訂單，請透過 LINE {studioInfo.line} 告知
            </li>
            <li>
              <Icon name="pin" size={18} />
              <a href={studioInfo.mapUrl} target="_blank" rel="noreferrer" className="inline-link">
                {studioInfo.address}
              </a>
            </li>
          </ul>
        </div>

        <div className="center-actions">
          <Button to="/shop" variant="secondary">
            繼續選購
          </Button>
          <Button to="/schedule" arrow>
            查看課表
          </Button>
        </div>
      </div>
    </section>
  )
}
