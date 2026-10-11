import { useEffect, useRef, useState } from 'react'

const MOUSE_THRESHOLD = 5 // 滑鼠移動超過幾 px 才算開始拖曳
const TOUCH_HOLD_MS = 300 // 手機長按多久才開始拖曳，避免跟捲動衝突
const TOUCH_SLOP = 8 // 長按期間手指移動超過幾 px 就當作是在捲動

// 用 pointer events 實作拖曳改期，滑鼠與觸控都能用。
// 放置目標是任何帶有 data-drop-date 的元素。
export default function useBookingDrag({ canDrop, onDrop }) {
  const [drag, setDrag] = useState(null) // { booking, x, y, over }
  const pending = useRef(null)
  const active = useRef(null)
  const suppressClick = useRef(false)
  const handlers = useRef({ canDrop, onDrop })
  const beginRef = useRef(null)

  useEffect(() => {
    handlers.current = { canDrop, onDrop }
  })

  useEffect(() => {
    const targetAt = (x, y) => {
      const el = document.elementFromPoint(x, y)?.closest('[data-drop-date]')
      return el ? el.dataset.dropDate : null
    }

    const begin = (x, y) => {
      const { booking } = pending.current
      active.current = { booking, over: null }
      pending.current = null
      suppressClick.current = true
      navigator.vibrate?.(10)
      setDrag({ booking, x, y, over: null })
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
        active.current.over = over
        setDrag({ booking: active.current.booking, x: e.clientX, y: e.clientY, over })
      }
    }

    const end = () => {
      cancelPending()
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
