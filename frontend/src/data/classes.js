import { images } from './images'

// 課程方案。一位教練，最多同時指導三位學員。
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
    image: images.tools,
    tagline: '第一次來？從一堂完整的評估開始。',
    description:
      '教練會先了解你的運動習慣、生活作息與目標，再透過動作檢測找出身體的強項與需要加強的地方，最後帶你實際練一輪，讓你清楚知道接下來該怎麼練。',
    expect: [
      '10 分鐘目標諮詢與健康問卷',
      '15 分鐘功能性動作檢測（深蹲、髖鉸鏈、肩關節活動度）',
      '30 分鐘依檢測結果設計的入門訓練',
      '5 分鐘討論後續訓練建議與方案',
    ],
    suitable: ['從來沒有上過私人教練課', '想先了解教練風格再決定方案', '中斷運動一段時間，想重新開始'],
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
    image: images.grip,
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
    image: images.squat,
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
  {
    id: 'one-on-three',
    name: '1對3 三人小團體',
    en: 'Small Group',
    format: 'trio',
    formatLabel: '1對3',
    capacity: 3,
    duration: 60,
    price: 800,
    image: images.ropes,
    tagline: '小團體的氣氛，私教的品質。',
    description:
      '三人一組、固定時段上課，保有教練對每個人的動作指導，又有團體課的熱度與互相激勵。也可以單獨報名，加入尚有名額的固定班。',
    expect: [
      '循環式訓練，三人分站輪替',
      '教練巡迴指導、即時修正每個人的動作',
      '以肌力為主、體能為輔的完整課表',
      '每月一次小組體能測驗，看見彼此進步',
    ],
    suitable: ['喜歡有人一起練的團體氣氛', '已有基本動作概念，想穩定進步', '想用最實惠的價格接受專業指導'],
  },
]

export const formatFilters = [
  { value: 'all', label: '全部' },
  { value: 'solo', label: '1對1' },
  { value: 'duo', label: '1對2' },
  { value: 'trio', label: '1對3' },
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
