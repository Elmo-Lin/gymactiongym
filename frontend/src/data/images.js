// 示意圖片（Unsplash）。正式上線時可換成健身房實拍照片。
const unsplash = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const images = {
  hero: unsplash('1517836357463-d25dfeac3438', 2000),
  studio: unsplash('1534438327276-14e5300c3a48'),
  dumbbells: unsplash('1576678927484-cc907957088c'),
  grip: unsplash('1549060279-7e168fcee0c2'),
  rack: unsplash('1583454110551-21f2fa2afe61'),
  squat: unsplash('1541534741688-6078c6bfb5c5'),
  ropes: unsplash('1599058917212-d750089bc07e'),
  pushup: unsplash('1594737625785-a6cbdabd333c'),
  tools: unsplash('1584735935682-2f2b69dff9d2'),
  dark: unsplash('1605296867304-46d5465a13f1'),
  coach: unsplash('1581009146145-b5ef050c2e1e', 1200),
  coachAlt: unsplash('1532029837206-abbe2b7620e3', 1200),
}
