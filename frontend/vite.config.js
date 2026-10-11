import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 預設只支援 iOS 16.4 以上；放寬到 iOS 14，避免舊 iPhone 載入失敗、按鈕全部失效
    target: ['es2020', 'safari14', 'chrome87', 'firefox78', 'edge88'],
    // 兩個頁面分開打包：網站（index.html）與教練後台（admin.html）
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin.html'),
      },
    },
  },
})
