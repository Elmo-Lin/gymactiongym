import { useEffect, useRef, useState } from 'react'

const MOUSE_THRESHOLD = 5 // 滑鼠移動超過幾 px 才算開始拖曳
const TOUCH_HOLD_MS = 300 // 手機長按多久才開始拖曳，避免跟捲動衝突
const TOUCH_SLOP = 8 // 長按期間手指移動超過幾 px 就當作是在捲動
const NAV_HOLD_MS = 600 // 拖到換週箭頭上停多久才換週；繼續停著會每隔這麼久再換一週

// 用 pointer events 實作拖曳改期，滑鼠與觸控都能用。
// 放置目標是任何帶有 data-drop-date 的元素。
// 帶有 data-drop-nav（-1 或 1）的元素是換週箭頭：拖到上面停一下就呼叫 onNavigate 換週，可以把課拖到其他週
export default function useBookingDrag({ canDrop, onDrop, onNavigate }) {
  const [drag, setDrag] = useState(null) // { booking, x, y, over, nav }
  const pending = useRef(null)
  const active = useRef(null)
  const suppressClick = useRef(false)
  const handlers = useRef({ canDrop, onDrop, onNavigate })
  const beginRef = useRef(null)
  const navHold = useRef(null) // { dir, timer }：正停在換週箭頭上

  useEffect(() => {
    handlers.current = { canDrop, onDrop, onNavigate }
  })

  useEffect(() => {
    const targetAt = (x, y) => {
      const el = document.elementFromPoint(x, y)?.closest('[data-drop-date]')
      return el ? el.dataset.dropDate : null
    }

    const navAt = (x, y) => document.elementFromPoint(x, y)?.closest('[data-drop-nav]')?.dataset.dropNav ?? null

    const clearNav = () => {
      if (navHold.current) window.clearTimeout(navHold.current.timer)
      navHold.current = null
    }

    // 停在換週箭頭上：等一下就換週，繼續停著會一直換下去；移開就取消
    const holdNav = (dir) => {
      if (navHold.current?.dir === dir) return
      clearNav()
      if (!dir) return
      const tick = () => {
        handlers.current.onNavigate?.(Number(dir))
        navHold.current = { dir, timer: window.setTimeout(tick, NAV_HOLD_MS) }
      }
      navHold.current = { dir, timer: window.setTimeout(tick, NAV_HOLD_MS) }
    }

    const begin = (x, y) => {
      const { booking } = pending.current
      active.current = { booking, over: null }
      pending.current = null
      suppressClick.current = true
      navigator.vibrate?.(10)
      setDrag({ booking, x, y, over: null, nav: null })
    }
    beginRef.current = begin

    const move = (e) => {
      const p = pending.current
      if (p && e.pointerId === p.pointerId) {
        const dist = Math.hypot(e.clientX - p.x, e.clientY - p.y)
        if (p.touch) {
          if (dist > TOUCH_SLOP) cancelPending()
        } else if (dist > MOUSE_THRESHOLD) {
          begin(e.clientX, e.clientY)
        }
      }
      if (active.current) {
        const date = targetAt(e.clientX, e.clientY)
        const over = date && handlers.current.canDrop(active.current.booking, date) ? date : null
        const nav = navAt(e.clientX, e.clientY)
        holdNav(nav)
        active.current.over = over
        setDrag({ booking: active.current.booking, x: e.clientX, y: e.clientY, over, nav })
      }
    }

    const end = () => {
      cancelPending()
      clearNav()
      const a = active.current
      if (!a) return
      active.current = null
      setDrag(null)
      if (a.over) handlers.current.onDrop(a.booking, a.over)
      // 放開後瀏覽器還會補發一次 click，略過它，避免拖完就打開學生頁
      window.setTimeout(() => (suppressClick.current = false), 0)
    }

    const cancelPending = () => {
      if (pending.current?.timer) window.clearTimeout(pending.current.timer)
      pending.current = null
    }

    // 拖曳中阻止頁面捲動（必須是非 passive 的 touchmove）
    const blockScroll = (e) => {
      if (active.current) e.preventDefault()
    }

    const onKey = (e) => {
      if (e.key === 'Escape' && active.current) {
        active.current.over = null
        end()
      }
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    window.addEventListener('touchmove', blockScroll, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      clearNav()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      window.removeEventListener('touchmove', blockScroll)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  // 綁在可拖曳的課程上
  const dragProps = (booking) => ({
    onPointerDown: (e) => {
      if (e.button !== 0) return
      const p = {
        booking,
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        touch: e.pointerType !== 'mouse',
      }
      if (p.touch) {
        p.timer = window.setTimeout(() => {
          if (pending.current === p) beginRef.current(p.x, p.y)
        }, TOUCH_HOLD_MS)
      }
      pending.current = p
    },
    onClickCapture: (e) => {
      if (suppressClick.current) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    onContextMenu: (e) => {
      // 長按時不要跳出系統選單
      if (e.nativeEvent.pointerType !== 'mouse') e.preventDefault()
    },
  })

  return { drag, dragProps }
}
