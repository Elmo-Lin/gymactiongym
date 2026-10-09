// 課程方案，需與後端 Plan.java 保持一致。一位教練，最多同時指導兩位學員。
// 每個時段只服務一組學員：1對2 的同行者是會員自己帶的朋友，不會和不認識的人一起上課。
// 價格皆為「每人每堂」，固定時段方案依週數給予折扣。
export const plans = [
  {
    id: 'trial',
    name: '首次體驗課',
    en: 'First Session',
    format: 'trial',
    formatLabel: '體驗',
    capacity: 1,
    duration: 60,
    price: 800,
    tagline: '第一次來？從一堂完整的評估開始。',
    description:
      '教練會先了解你的運動習慣、生活作息與目標，再透過動作檢測找出身體的強項與需要加強的地方，最後帶你實際練一輪，讓你清楚知道接下來該怎麼練。',
    expect: [
      '10 分鐘目標諮詢與健康問卷',
      '15 分鐘功能性動作檢測（深蹲、髖鉸鏈、肩關節活動度）',
      '30 分鐘依檢測結果設計的入門訓練',
      '5 分鐘討論後續訓練建議與方案',
    ],
    suitable: ['從來沒有上過私人教練課', '中斷運動一段時間，想重新開始'],
    singleOnly: true,
  },
  {
    id: 'one-on-one',
    name: '1對1 私人教練課',
    en: 'Personal Training',
    format: 'solo',
    formatLabel: '1對1',
    capacity: 1,
    duration: 60,
    price: 1600,
    tagline: '整堂課的注意力都在你身上。',
    description:
      '完全依照你的身體狀況與目標設計課表，每一個動作都有教練即時修正。適合有明確目標、需要高度客製化，或有舊傷需要特別留意的學員。',
    expect: [
      '每堂課前確認當天身體狀態，彈性調整強度',
      '動作細節逐一修正，建立正確發力模式',
      '每 4 週重新檢測，追蹤力量與體態變化',
      '提供課後居家伸展與飲食建議',
    ],
    suitable: ['有明確目標：增肌、減脂、比賽備戰', '有舊傷或疼痛問題，需要個別化調整', '時間有限，想讓每一分鐘都更有效率'],
  },
  {
    id: 'one-on-two',
    name: '1對2 雙人小班',
    en: 'Duo Training',
    format: 'duo',
    formatLabel: '1對2',
    capacity: 2,
    duration: 60,
    price: 1000,
    tagline: '找個夥伴一起練，更容易堅持。',
    description:
      '和朋友、伴侶或家人一起上課，教練依兩人的程度安排同主題、不同強度的訓練。有人陪伴更有動力，費用也更划算。',
    expect: [
      '兩人輪流進行主訓練，教練逐一指導',
      '依各自程度調整重量與動作變化',
      '搭配雙人互動的體能訓練與核心練習',
      '定期檢測，兩人各自追蹤進度',
    ],
    suitable: ['想和朋友、伴侶一起養成運動習慣', '兩人程度相近、目標類似', '希望兼顧個別指導與合理預算'],
  },
]

export const formatFilters = [
  { value: 'all', label: '全部' },
  { value: 'solo', label: '1對1' },
  { value: 'duo', label: '1對2' },
  { value: 'trial', label: '體驗課' },
]

// 固定每週時段的週數選項
export const weeklyPackages = [
  { weeks: 4, label: '4 週', discount: 1, note: '原價' },
  { weeks: 8, label: '8 週', discount: 0.95, note: '95 折' },
  { weeks: 12, label: '12 週', discount: 0.9, note: '9 折' },
]

export const trainingGoals = [
  { id: 'muscle', label: '增肌', desc: '漸進式超負荷訓練，搭配飲食建議，穩定增加肌肉量。' },
  { id: 'fatloss', label: '減脂', desc: '肌力訓練結合代謝體能，提高基礎代謝、減少體脂。' },
  { id: 'posture', label: '體態改善', desc: '針對圓肩、骨盆前傾等問題，重建身體的平衡。' },
  { id: 'fitness', label: '體能提升', desc: '心肺耐力與爆發力訓練，讓日常活動更輕鬆。' },
  { id: 'rehab', label: '傷後回歸', desc: '與物理治療建議配合，循序漸進恢復訓練能力。' },
  { id: 'senior', label: '銀髮肌力', desc: '以安全為前提，強化平衡與下肢力量，預防跌倒。' },
]

export const getPlan = (id) => plans.find((p) => p.id === id)
