// build 後為每個公開頁面產生靜態 HTML，讓 Google 不必執行 JavaScript 就能讀到標題、描述與內容。
// 檔案以 about.html 形式輸出，搭配 firebase.json 的 cleanUrls 由 /about 提供。
// 同時輸出 sitemap.xml、robots.txt，以及給其他網址使用的空白殼 app.html。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const { render, getSeo, getBusinessJsonLd, indexablePaths, SITE_URL } = await import(
  pathToFileURL(path.join(ssrDir, 'entry-server.js')).href
)

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

const setTag = (html, pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`prerender: index.html 缺少 ${pattern}`)
  return html.replace(pattern, replacement)
}

function applyHead(html, seo) {
  html = setTag(html, /<title>[^<]*<\/title>/, `<title>${escapeText(seo.title)}</title>`)
  html = setTag(html, /<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeAttr(seo.description)}"`)
  html = setTag(html, /<meta name="robots" content="[^"]*"/, `<meta name="robots" content="${seo.noindex ? 'noindex, follow' : 'index, follow'}"`)
  html = setTag(html, /<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${escapeAttr(seo.url)}"`)
  html = setTag(html, /<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeAttr(seo.title)}"`)
  html = setTag(html, /<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escapeAttr(seo.description)}"`)
  html = setTag(html, /<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${escapeAttr(seo.url)}"`)
  html = setTag(html, /<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${escapeAttr(seo.image)}"`)
  return html
}

let template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const jsonLd = JSON.stringify(getBusinessJsonLd()).replace(/</g, '\\u003c')
template = template.replace('</head>', `    <script type="application/ld+json">${jsonLd}</script>\n  </head>`)

// 非公開頁面（預約、購物車、404）使用的殼：不預先渲染內容，標記為 noindex，換頁後由 Seo 元件更新
fs.writeFileSync(path.join(dist, 'app.html'), applyHead(template, { ...getSeo('/'), noindex: true }))

for (const url of indexablePaths) {
  const appHtml = render(url)
  const html = applyHead(template, getSeo(url)).replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
  const file = url === '/' ? path.join(dist, 'index.html') : path.join(dist, `${url.slice(1)}.html`)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
}

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexablePaths.map((url) => `  <url><loc>${SITE_URL}${url}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap)
fs.writeFileSync(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nDisallow: /booking\nDisallow: /cart\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
)

fs.rmSync(ssrDir, { recursive: true, force: true })
console.log(`prerender: ${indexablePaths.length} 個頁面、sitemap.xml、robots.txt`)
