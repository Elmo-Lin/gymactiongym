import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import CartProvider from './components/CartProvider'

export { getBusinessJsonLd, getSeo, indexablePaths, SITE_URL } from './data/seo'

export function render(url) {
  return renderToString(
    <StrictMode>
      <CartProvider>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </CartProvider>
    </StrictMode>,
  )
}
