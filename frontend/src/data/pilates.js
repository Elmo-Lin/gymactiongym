// 器械皮拉提斯（霏霏教練）的介紹內容；課程方案與價格在 data/classes.js（program: 'pilates'）。
// 教練介紹為示意資料，請替換成實際內容。
const photo = (name) => `/images/pilates/${name}.jpg`

export const pilatesCoach = {
  id: 'feifei',
  name: '霏霏教練',
  title: '皮拉提斯教練',
  // 教練本人的照片網址。還沒有實拍照時保持 null，網站會改顯示品牌圖案（components/CoachPhoto.jsx）
  photo: null,
  intro: '皮拉提斯不只是伸展，而是學會用核心穩定地控制每一個動作。',
  bio: [
    '專注器械皮拉提斯教學，擅長從呼吸與骨盆位置開始，帶學員找到深層核心的發力方式。',
    '課程依每個人的身體狀況調整彈簧阻力與動作變化，不論是第一次接觸，或想改善久坐造成的痠痛與體態問題，都能循序漸進地練習。',
  ],
  certifications: ['國際器械皮拉提斯師資認證', '墊上皮拉提斯師資認證', 'CPR + AED 急救證照'],
  specialties: ['器械皮拉提斯', '核心穩定', '體態改善', '產後恢復', '久坐痠痛'],
}

export const pilates = {
  name: '器械皮拉提斯',
  en: 'Pilates',
  tagline: '用器械的彈簧阻力，練出穩定的核心與好看的體態。',
  description:
    '在專屬的皮拉提斯教室，使用 Reformer、Cadillac 與 Chair 等器械上課。彈簧可以提供阻力，也能在動作中給予支撐，讓初學者更容易做出正確的動作，也能隨著進步逐步增加挑戰。',
  suitable: ['久坐、肩頸或下背容易痠痛', '想改善圓肩、骨盆前傾等體態問題', '產後想重新找回核心力量', '想搭配肌力訓練，提升身體控制能力'],
  equipment: [
    {
      name: 'Reformer 核心床',
      desc: '可以滑動的床台搭配彈簧與拉繩，躺、坐、跪、站都能練，是最經典的皮拉提斯器械。',
      photo: photo('reformer'),
    },
    {
      name: 'Cadillac 鞦韆床',
      desc: '有高架與多種彈簧、吊環，適合做伸展、脊椎活動度，以及需要更多支撐的動作。',
      photo: photo('cadillac'),
    },
    {
      name: 'Chair 穩踏椅',
      desc: '體積小但挑戰度高，踩踏板的動作需要大量的平衡與核心控制。',
      photo: photo('chair'),
    },
  ],
  // 教室環境照片，第一張也用在頁面最上方的主視覺
  gallery: [
    { src: photo('studio-wide'), alt: '皮拉提斯教室：兩台 Reformer 與 Chair，窗邊有白色紗簾' },
    { src: photo('studio-reformers'), alt: 'Reformer 核心床與後方的 Chair 穩踏椅' },
    { src: photo('reformer-window'), alt: '窗邊的 Reformer 核心床' },
  ],
}
