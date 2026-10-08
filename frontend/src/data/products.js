// 店內販售的營養補給品，資料取自現場價目表（果果能量 GOpower、PlantsB 彼蛋白）。
// sweetness：甜度 1–5 顆星；hot：店家標示的熱銷品項；diet：素食標示。
// 品項 id 由系列 id 與順序組成，調整順序會影響購物車內既有的品項，新增品項請加在列表最後。

import gopowerLogo from '../assets/brands/gopower.png'
import plantsbLogo from '../assets/brands/plantsb.png'

// 商標取自品牌官網（gogonuts.best、plantsb.co）；GOpower 官方商標為白色，需放在深色底上
export const brands = {
  gopower: { name: '果果能量 GOpower', logo: gopowerLogo, dark: true },
  plantsb: { name: 'PlantsB 彼蛋白', logo: plantsbLogo },
}

export const productCategories = [
  { value: 'all', label: '全部商品' },
  { value: 'whey', label: '乳清蛋白' },
  { value: 'plant', label: '植物蛋白' },
  { value: 'supplement', label: '肌酸・胺基酸' },
  { value: 'snack', label: '蛋白點心' },
  { value: 'drink', label: '即飲' },
]

const p = (name, sweetness = 0, extra = {}) => ({ name, sweetness, ...extra })

const rawSeries = [
  {
    id: 'whey',
    category: 'whey',
    brand: 'gopower',
    en: 'Whey Protein Concentrate',
    name: '濃縮乳清',
    desc: '日常補充、保留最原型、最豐富的營養素。',
    options: [
      { label: '35g 隨身包', price: 55 },
      { label: '500g', price: 649 },
      { label: '1kg', price: 1249 },
    ],
    items: [
      p('經典原味', 0, { options: [{ label: '500g', price: 639 }, { label: '1kg', price: 1239 }] }),
      p('芝麻拿鐵', 1, { hot: true }),
      p('紫薯芋泥', 1, { hot: true }),
      p('冬瓜鮮奶', 3),
      p('草莓牛奶', 3, { hot: true }),
      p('楊枝甘露', 3),
      p('麥芽可可', 3, { hot: true }),
      p('紅豆歐蕾', 4),
      p('琥珀歐蕾', 4),
      p('泰式奶茶', 5, { hot: true }),
      p('臻醇可可', 3, { hot: true }),
      p('純粹那堤', 1),
      p('紅韻歐蕾', 1, { hot: true }),
      p('香蕉巧克力', 2),
      p('焦糖騎朵', 2),
      p('鴛鴦奶茶', 2),
      p('日式抹茶', 2),
      p('烏龍奶茶', 3),
      p('經典奶茶', 3),
      p('好事花生', 3),
      p('茉綠歐蕾', 3, { hot: true }),
      p('鴨屎香檸檬', 3),
    ],
  },
  {
    id: 'hydro',
    category: 'whey',
    brand: 'gopower',
    en: 'Hydrolyzed Whey',
    name: '水解乳清',
    desc: '獨家水解技術，將蛋白質轉換為更小形式，適合腸胃吸收較不佳者。',
    options: [
      { label: '35g 隨身包', price: 60 },
      { label: '500g', price: 729 },
    ],
    items: [
      p('無調味', 0, { options: [{ label: '500g', price: 719 }] }),
      p('綠豆沙牛奶', 1, { hot: true }),
      p('海鹽焦糖', 1, { hot: true }),
      p('可可歐蕾', 2),
      p('香蕉牛奶', 3, { hot: true }),
      p('木瓜牛奶', 4),
      p('雙桃果茶', 1, { hot: true }),
      p('桂花烏龍', 1, { hot: true }),
      p('優格多多', 3),
      p('蜂蜜檸檬', 3, { hot: true }),
      p('生椰拿鐵', 2),
    ],
  },
  {
    id: 'casein',
    category: 'whey',
    brand: 'gopower',
    en: 'Micellar Casein',
    name: '緩釋酪蛋白',
    desc: '適合餐間、練後、睡眠中持續補給。',
    options: [
      { label: '35g 隨身包', price: 60 },
      { label: '500g', price: 729 },
    ],
    items: [p('夜巡芝麻', 1), p('濃醇黑巧', 1, { hot: true })],
  },
  {
    id: 'creatine',
    category: 'supplement',
    brand: 'gopower',
    en: 'Creatine Micronized',
    name: '微粉化肌酸',
    desc: '提供專業運動所需，由三種胺基酸組合而成的天然化合物。',
    options: [{ label: '420g', price: 659 }],
    items: [
      p('經典原味', 0, { options: [{ label: '400g', price: 649 }] }),
      p('檸檬萊姆', 3, { hot: true }),
      p('仲夏野莓', 3),
      p('海鹽柚子', 3),
      p('香檸蜂蜜', 2),
      p('冰糖雪梨', 5, { hot: true }),
    ],
  },
  {
    id: 'eaa',
    category: 'supplement',
    brand: 'gopower',
    en: 'PRO EAAs',
    name: '必需胺基酸',
    desc: '提供 9 種人體無法自行製造的必需胺基酸。',
    options: [{ label: '420g', price: 1099 }],
    items: [p('檸檬紅茶', 3, { hot: true }), p('梅子綠茶', 3), p('莓果爆擊', 3, { hot: true })],
  },
  {
    id: 'plant-creatine',
    category: 'supplement',
    brand: 'plantsb',
    en: 'Plant Care: Creatine',
    name: '植日生系列・美日肌酸',
    desc: '提供能量、穩定日常活力。',
    options: [{ label: '30 入／盒', price: 380 }],
    items: [p('水漾蜜桃', 0, { diet: '全素' }), p('玫瑰青檸', 0, { diet: '全素' })],
  },
  {
    id: 'simple-b',
    category: 'plant',
    brand: 'plantsb',
    en: 'Simple B',
    name: '植白系列・植選蛋白粉',
    desc: '最純粹的植物蛋白，無香料、無色素、無添加。',
    options: [
      { label: '35g 隨身包', price: 50 },
      { label: '500g', price: 449 },
    ],
    items: [
      p('日式抹茶', 0, { diet: '全素' }),
      p('純粹可可', 0, { diet: '全素' }),
      p('莊園瑪黛', 0, { diet: '全素' }),
      p('研磨芝麻', 0, { diet: '全素', note: '不加糖' }),
    ],
  },
  {
    id: 'amazing-b',
    category: 'plant',
    brand: 'plantsb',
    en: 'Amazing B',
    name: '植琢系列・植選蛋白粉',
    desc: '營養豐富，添加礦物質、維生素與益生菌。',
    options: [
      { label: '35g 隨身包', price: 50 },
      { label: '500g', price: 449 },
    ],
    items: [
      p('醇厚米漿', 0, { diet: '全素' }),
      p('榛實核桃', 0, { diet: '全素' }),
      p('金沙芝麻', 0, { diet: '奶素' }),
      p('蔬服綠拿鐵', 0, { diet: '全素', note: '不加糖' }),
      p('太妃糖湖鹽', 0, { diet: '全素' }),
      p('花生可可', 0, { diet: '全素' }),
    ],
  },
  {
    id: 'fiber-b',
    category: 'plant',
    brand: 'plantsb',
    en: 'Fiber B',
    name: '優纖鈣系列・植選蛋白粉',
    desc: '添加玉米來源可溶性纖維、海藻鈣，補充纖維與鈣質。',
    options: [
      { label: '35g 隨身包', price: 50 },
      { label: '500g', price: 449 },
    ],
    items: [p('紫米薏仁', 0, { diet: '全素' }), p('客家擂茶', 0, { diet: '全素' })],
  },
  {
    id: 'soup',
    category: 'plant',
    brand: 'plantsb',
    en: 'Soup',
    name: '高蛋白植感濃湯',
    desc: '喝湯同時保養！添加流行鏈球菌發酵物（含透明質酸鈉）。',
    options: [{ label: '35g', price: 55 }],
    items: [p('田園玉米', 0, { diet: '全素' }), p('蘑菇馬鈴薯', 0, { diet: '全素' })],
  },
  {
    id: 'crisp',
    category: 'snack',
    brand: 'gopower',
    en: 'Protein Crisps',
    name: '蛋白香酥脆',
    desc: '每包含 16 克蛋白質，採多種植物蛋白低溫烘烤製作。',
    options: [{ label: '單包', price: 45 }],
    items: [
      p('朱雀辛咖喱', 0, { diet: '五辛素', note: 'ft. 朱雀咖喱・含蛋、奶' }),
      p('愛情海瓜子', 0, { diet: '葷', hot: true, note: 'ft. 插畫家唐葫蘆姑娘' }),
      p('和風壽喜燒', 0, { diet: '五辛素' }),
      p('義式紅醬披薩', 0, { diet: '五辛素' }),
      p('泰式酸辣', 0, { diet: '五辛素' }),
      p('金沙酷浪', 0, { diet: '蛋奶素' }),
      p('起司龍捲風', 0, { diet: '奶素' }),
      p('香辣肉燥', 0, { diet: '五辛素' }),
    ],
  },
  {
    id: 'wafer',
    category: 'snack',
    brand: 'gopower',
    en: 'Protein Wafers',
    name: '蛋白威化餅',
    desc: '每支含 9 克蛋白質，並添加 MCT 中鏈三酸甘油脂，減輕身體負擔。',
    options: [
      { label: '單包', price: 44 },
      { label: '盒裝 6 入', price: 259 },
    ],
    items: [
      p('特濃花生', 0, { diet: '奶素', hot: true }),
      p('藍莓起司', 0, { diet: '奶素', hot: true }),
      p('芝麻', 0, { diet: '奶素' }),
      p('檸檬起司', 0, { diet: '奶素' }),
      p('巧克力', 0, { diet: '奶素' }),
      p('濃韻焙茶', 0, { diet: '奶素', note: 'ft. 健身工廠聯名' }),
      p('香草牛奶', 0, { diet: '奶素', hot: true, note: 'ft. 健身工廠聯名' }),
      p('香蕉可可', 0, { diet: '奶素', note: 'ft. 健身工廠聯名' }),
    ],
  },
  {
    id: 'bar',
    category: 'snack',
    brand: 'gopower',
    en: 'Crispy Protein Bar',
    name: '脆米蛋白棒',
    desc: '每支含 12 克蛋白質，使用 MCT 中鏈三酸甘油脂。',
    options: [
      { label: '單包', price: 66 },
      { label: '盒裝 6 入', price: 379 },
    ],
    items: [
      p('鴛鴦奶茶', 0, { diet: '奶素' }),
      p('双癒可可', 0, { diet: '奶素' }),
      p('極真抹茶', 0, { diet: '奶素' }),
      p('果果乳加', 0, { diet: '奶素' }),
    ],
  },
  {
    id: 'oat',
    category: 'snack',
    brand: 'gopower',
    en: 'Oatmeal Cookies',
    name: '燕麥脆片',
    desc: '搭配無糖豆漿與南瓜子，喀滋超脆口！使用異麥芽寡糖，享受美味不負擔。',
    options: [{ label: '單包', price: 39 }],
    items: [
      p('金沙鹹蛋', 0, { diet: '蛋素' }),
      p('醇黑芝麻', 0, { diet: '全素' }),
      p('纖脆可可', 0, { diet: '全素' }),
      p('酥烤海苔', 0, { diet: '全素' }),
      p('伯爵厚奶', 0, { diet: '奶素', hot: true }),
    ],
  },
  {
    id: 'oat-b',
    category: 'snack',
    brand: 'plantsb',
    en: 'Oat',
    name: '麥脆朵朵',
    desc: '高纖配方、聰明減糖，療癒午茶時刻。',
    options: [{ label: '40g', price: 39 }],
    items: [p('黑糖肉桂', 0, { diet: '全素' }), p('濃布朗尼', 0, { diet: '奶素' })],
  },
  {
    id: 'rtd',
    category: 'drink',
    brand: 'gopower',
    en: 'Protein Fuel',
    name: '蛋白能量飲',
    desc: '乳清蛋白＋酪蛋白雙蛋白配方，鋁罐包裝，開蓋即飲好攜帶。',
    options: [],
    items: [
      p('麥芽牛奶', 0, { options: [{ label: '6 入組', price: 289 }, { label: '24 入組', price: 1099 }] }),
      p('芝麻牛奶', 0, { options: [{ label: '6 入組', price: 329 }, { label: '24 入組', price: 1269 }] }),
    ],
  },
]

export const productSeries = rawSeries.map(({ items, ...series }) => ({
  ...series,
  products: items.map((item, i) => ({
    ...item,
    id: `${series.id}-${i + 1}`,
    seriesId: series.id,
    seriesName: series.name,
    options: item.options ?? series.options,
  })),
}))

const productMap = new Map(productSeries.flatMap((s) => s.products.map((prod) => [prod.id, prod])))

export const getProduct = (id) => productMap.get(id)

export const getOption = (product, label) => product?.options.find((o) => o.label === label)
