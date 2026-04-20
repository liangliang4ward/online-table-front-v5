/**
 * 应用配置文件
 */

export interface AppConfig {
  name: string
  title: string
  version: string
  env: string
  requireQiankun: boolean
  mountElement: string
  base: string
  apiBase: string
  router: {
    home: string
  }
  timeout: number
  enableLog: boolean
}

const {
  VITE_APP_TITLE,
  VITE_APP_VERSION,
  VITE_API_BASE,
  VITE_BASE_PATH,
  VITE_TIMEOUT,
  VITE_ENABLE_LOG,
  VITE_APP_ENV,
  VITE_REQUIRE_QIANKUN
} = import.meta.env

const config: AppConfig = {
  name: 'template',
  title: VITE_APP_TITLE || 'Sub App Template',
  version: VITE_APP_VERSION || '1.0.0',
  env: VITE_APP_ENV || 'development',
  requireQiankun: VITE_REQUIRE_QIANKUN === 'true' || VITE_APP_ENV === 'production',
  mountElement: '#subApp',
  base: VITE_BASE_PATH || '/',
  apiBase: VITE_API_BASE || '/api',
  router: {
    home: '/index'
  },
  timeout: Number(VITE_TIMEOUT) || 5000,
  enableLog: VITE_ENABLE_LOG !== 'false'
}

export default config