// 示意圖片（Unsplash）。正式上線時可換成健身房實拍照片。
// 只用沒有人物、或看不到臉的器材與空間照：圖庫的人物照擺拍感太重，也容易讓客人誤以為是教練或學員本人。
// 全站照片另外以 CSS 降低彩度（styles/index.css 的 .photo img）
const unsplash = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const images = {
  // 首頁主視覺、預設分享圖：只有幾座深蹲架的小工作室
  hero: unsplash('1784798228092-659924b1a15b', 2000),
  // 首頁「關於即動」：陽光照進小房間的深蹲架
  studio: unsplash('1558611848-73f7eb4001a1'),
  // 首頁最下方 CTA 背景
  dark: unsplash('1517836357463-d25dfeac3438'),
}
