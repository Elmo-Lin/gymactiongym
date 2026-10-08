// 前端的三種模式，由 Vite 的 mode 決定（啟動或打包時用 --mode 指定，見 package.json）：
//   static       靜態網頁：不呼叫 API，訂單存在瀏覽器（localStorage）   npm run dev:static / npm run build:static
//   development  開發模式：呼叫本機後端                                npm run dev
//   production   上線模式：呼叫 Cloud Run 上的後端                      npm run build
const modes = {
  static: {
    useApi: false,
    apiBaseUrl: '',
  },
  development: {
    useApi: true,
    apiBaseUrl: 'http://localhost:8080',
  },
  production: {
    useApi: true,
    apiBaseUrl: 'https://backend-950158437121.asia-east1.run.app',
  },
}

export const mode = import.meta.env.MODE

// 不認得的 mode 一律當成靜態網頁，避免誤打 API
export const config = modes[mode] ?? modes.static
