import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 預設只支援 iOS 16.4 以上；放寬到 iOS 14，避免舊 iPhone 載入失敗、按鈕全部失效
  build: { target: ['es2020', 'safari14', 'chrome87', 'firefox78', 'edge88'] },
})
