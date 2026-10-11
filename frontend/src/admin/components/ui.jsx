const ICONS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  users: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M22 19v-1a4 4 0 0 0-3-3.9M16 3.1a3.5 3.5 0 0 1 0 6.8',
  calendar: 'M4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 10h16M8 3v4M16 3v4',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  back: 'M15 18 9 12l6-6',
  next: 'm9 18 6-6-6-6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  x: 'M6 6l12 12M18 6 6 18',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M20 20l-4-4',
  edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  alert: 'M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0',
  up: 'M12 19V5M5 12l7-7 7 7',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  note: 'M5 4h14v16H5zM9 9h6M9 13h6M9 17h3',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
}

export function Icon({ name, size = 20 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  )
}

// 剩餘堂數：正常時低調顯示，快用完才用強調色
export function Remaining({ remaining, total }) {
  const level = remaining === 0 ? 'empty' : remaining <= 3 ? 'low' : 'ok'
  return (
    <span className={`rem rem-${level}`}>
      {remaining === 0 ? (
        '已用完'
      ) : (
        <>
          剩 <b className="num">{remaining}</b>
          {total ? <span className="rem-total">/{total}</span> : ''} 堂
        </>
      )}
    </span>
  )
}
