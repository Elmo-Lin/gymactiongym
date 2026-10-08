import { useEffect, useMemo, useState } from 'react'
import { CartContext, MAX_QTY, cartKey, resolveCart } from '../context/cart'
import { loadCart, saveCart } from '../utils/storage'

const clampQty = (n) => Math.min(MAX_QTY, Math.max(1, Math.floor(n) || 1))

export default function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => saveCart(items), [items])

  // 其他分頁修改購物車時同步
  useEffect(() => {
    const onStorage = (e) => e.key === 'action-gym:cart' && setItems(loadCart())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => {
    const lines = resolveCart(items)
    const sameLine = (productId, option) => (i) => cartKey(i.productId, i.option) === cartKey(productId, option)

    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.qty, 0),
      total: lines.reduce((sum, l) => sum + l.subtotal, 0),
      add(productId, option, qty = 1) {
        setItems((prev) => {
          const existing = prev.find(sameLine(productId, option))
          if (!existing) return [...prev, { productId, option, qty: clampQty(qty) }]
          return prev.map((i) => (i === existing ? { ...i, qty: clampQty(i.qty + qty) } : i))
        })
      },
      setQty(productId, option, qty) {
        setItems((prev) => prev.map((i) => (sameLine(productId, option)(i) ? { ...i, qty: clampQty(qty) } : i)))
      },
      remove(productId, option) {
        setItems((prev) => prev.filter((i) => !sameLine(productId, option)(i)))
      },
      clear() {
        setItems([])
      },
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
