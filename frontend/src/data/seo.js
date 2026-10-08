import { coach } from './coach'
import { getPlan, plans } from './classes'
import { images } from './images'
import { studioInfo } from './schedule'

// 正式網域。若之後綁定自有網域，只要改這裡並重新 build。
export const SITE_URL = 'https://gymactiongym.web.app'
export const SITE_NAME = '即動 ACTION GYM'

const suffix = `｜${SITE_NAME} 楊梅`

const pages = {
  '/': {
    title: `${SITE_NAME}｜楊梅健身房・小班制私人教練`,
    description:
      '位於桃園楊梅的小班制肌力訓練工作室，一位教練最多兩位學員。提供 1對1、1對2 私人教練課與首次體驗課，增肌、減脂、體態改善，線上預約每週固定時段。',
  },
  '/about': {
    title: `關於我們・楊梅小班制健身工作室${suffix}`,
    description:
      '即動 ACTION GYM 是位於桃園楊梅的小型肌力訓練工作室，堅持一位教練最多帶兩位學員，重視動作品質與循序漸進，讓訓練成為長久的習慣。',
  },
  '/classes': {
    title: `課程方案與價格・楊梅私人教練課${suffix}`,
    description:
      '楊梅私人教練課程方案：首次體驗課、1對1 私人教練、1對2 雙人小班，每堂 60 分鐘，固定時段 8 週 95 折、12 週 9 折。',
  },
  '/coach': {
    title: `${coach.name}・${coach.title}${suffix}`,
    description: `${coach.name}：${coach.years} 年以上教學經驗，專長${coach.specialties.join('、')}。${coach.intro}`,
  },
  '/schedule': {
    title: `課表與預約時段${suffix}`,
    description: '查看即動 ACTION GYM 楊梅店每週課表與可預約時段，空堂可直接線上預約私人教練課，或加入現有的固定班。',
  },
  '/shop': {
    title: `營養補給・乳清蛋白、肌酸、蛋白點心${suffix}`,
    description:
      '楊梅健身房代售果果能量 GOpower 濃縮乳清、水解乳清、微粉化肌酸、蛋白棒，以及 Plants B 植物蛋白。線上下單，上課時到店取貨付款。',
  },
}

// 不需要被搜尋引擎收錄的頁面（預約流程、購物車）
const NOINDEX_PREFIXES = ['/booking', '/cart']

// 與其他網址內容相同的頁面，指向主要網址
const CANONICAL_ALIASES = { '/instructors': '/coach' }

export const DEFAULT_IMAGE = images.hero

export function getSeo(pathname) {
  const path = pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname
  const canonicalPath = CANONICAL_ALIASES[path] ?? path
  const noindex = NOINDEX_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))

  let meta = pages[canonicalPath]
  const classMatch = canonicalPath.match(/^\/classes\/([^/]+)$/)
  if (classMatch) {
    const plan = getPlan(classMatch[1])
    if (plan) {
      meta = {
        title: `${plan.name}・NT$${plan.price.toLocaleString('en-US')} 起${suffix}`,
        description: `${plan.tagline}${plan.description}`.slice(0, 150),
        image: plan.image,
      }
    }
  }

  return {
    title: meta?.title ?? `${SITE_NAME}｜楊梅健身房・小班制私人教練`,
    description: meta?.description ?? pages['/'].description,
    image: meta?.image ?? DEFAULT_IMAGE,
    url: `${SITE_URL}${canonicalPath === '/' ? '/' : canonicalPath}`,
    noindex: noindex || !meta,
  }
}

// 要預先產生 HTML、並列入 sitemap 的網址
export const indexablePaths = ['/', '/about', '/classes', ...plans.map((p) => `/classes/${p.id}`), '/coach', '/schedule', '/shop']

const DAY_CODES = { 週一至週五: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 週六: ['Saturday'], 週日: ['Sunday'] }

// Google 在地商家結構化資料（ExerciseGym）
export function getBusinessJsonLd() {
  const prices = plans.map((p) => p.price)
  return {
    '@context': 'https://schema.org',
    '@type': 'ExerciseGym',
    '@id': `${SITE_URL}/#gym`,
    name: studioInfo.name,
    alternateName: ['即動健身', 'ACTION GYM 楊梅', '即動 ACTION GYM'],
    description: pages['/'].description,
    url: `${SITE_URL}/`,
    image: [DEFAULT_IMAGE, images.studio],
    telephone: `+886-${studioInfo.phone.replace(/^0/, '')}`,
    email: studioInfo.email,
    priceRange: `NT$${Math.min(...prices)}–${Math.max(...prices)}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '楊江里光華街 8 號',
      addressLocality: '楊梅區',
      addressRegion: '桃園市',
      postalCode: '326',
      addressCountry: 'TW',
    },
    areaServed: '桃園市楊梅區',
    hasMap: studioInfo.mapUrl,
    sameAs: [studioInfo.instagramUrl],
    openingHoursSpecification: studioInfo.hours
      .filter((h) => DAY_CODES[h.days] && h.time.includes('–'))
      .map((h) => {
        const [opens, closes] = h.time.split('–').map((t) => t.trim())
        return { '@type': 'OpeningHoursSpecification', dayOfWeek: DAY_CODES[h.days], opens, closes }
      }),
  }
}
