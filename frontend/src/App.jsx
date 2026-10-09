import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import CartProvider from './components/CartProvider'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import Seo from './components/Seo'
import Booking from './pages/Booking'
import Cart from './pages/Cart'
import BookingConfirmation from './pages/BookingConfirmation'
import ClassDetail from './pages/ClassDetail'
import Classes from './pages/Classes'
import Coach from './pages/Coach'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import OrderConfirmation from './pages/OrderConfirmation'
import Schedule from './pages/Schedule'
import Shop from './pages/Shop'

function Layout() {
  return (
    <div className="app">
      <ScrollToTop />
      <Seo />
      <Navbar />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

// 從不同入口（課表、課程頁）進入預約時重新初始化流程
function BookingRoute() {
  const { pathname, search } = useLocation()
  return <Booking key={pathname + search} />
}

// 瀏覽器與 build 時預先產生 HTML（entry-server.jsx）共用同一份路由
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        {/* 「關於我們」已併入首頁與教練介紹，舊連結導回首頁（正式站由 firebase.json 的 redirects 處理） */}
        <Route path="/about" element={<Navigate to="/" replace />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/:id" element={<ClassDetail />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/instructors" element={<Coach />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/booking" element={<BookingRoute />} />
        <Route path="/booking/confirmation" element={<BookingConfirmation />} />
        <Route path="/booking/:classId" element={<BookingRoute />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/cart/confirmation" element={<OrderConfirmation />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </CartProvider>
  )
}
