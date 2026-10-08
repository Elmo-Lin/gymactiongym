import { createContext, useContext } from 'react'
import { getOption, getProduct } from '../data/products'

export const CartContext = createContext(null)

export const useCart = () => useContext(CartContext)

export const MAX_QTY = 99

export const cartKey = (productId, option) => `${productId}|${option}`

// 以目前的商品資料計算價格；已下架或規格不存在的品項會被略過
export function resolveCart(items) {
  return items.flatMap((item) => {
    const product = getProduct(item.productId)
    const option = getOption(product, item.option)
    if (!product || !option) return []
    return [{ ...item, key: cartKey(item.productId, item.option), product, price: option.price, subtotal: option.price * item.qty }]
  })
}
