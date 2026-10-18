// 主選單。有 children 的是下拉選單：健身與皮拉提斯各自的課程方案、教練、課表。
// match：網址在這些路徑底下時，下拉選單的標題顯示為目前所在的位置
export const navLinks = [
  { to: '/', label: '首頁', end: true },
  {
    label: '健身',
    match: ['/classes', '/coach', '/instructors', '/schedule'],
    children: [
      { to: '/classes', label: '課程方案' },
      { to: '/coach', label: '教練介紹' },
      { to: '/schedule', label: '課表' },
    ],
  },
  {
    label: '皮拉提斯',
    match: ['/pilates'],
    children: [
      { to: '/pilates', label: '課程方案', end: true },
      { to: '/pilates/coach', label: '教練介紹' },
      { to: '/pilates/schedule', label: '課表' },
    ],
  },
  { to: '/shop', label: '營養補給' },
]

export const isInGroup = (group, pathname) => group.match.some((p) => pathname === p || pathname.startsWith(`${p}/`))
