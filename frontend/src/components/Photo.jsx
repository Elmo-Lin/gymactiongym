import { useState } from 'react'

// 圖片載入失敗時，保留深灰漸層底色，版面不會破掉
export default function Photo({ src, alt = '', className = '', eager = false }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`photo ${className}`}>
      {!failed && (
        <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(true)} />
      )}
    </div>
  )
}
