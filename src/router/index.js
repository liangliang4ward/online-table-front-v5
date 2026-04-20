import { createRouter, createWebHistory } from 'vue-router'
import config from '@/config'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

const routes = [
  {
    path: '/',
    redirect: config.router.home
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import('@/views/index.vue')
  },
  {
    path: '/datasource',
    name: 'Datasource',
    component: () => import('@/views/datasource/index.vue'),
    meta: { title: '数据源管理' }
  },
  {
    path: '/tableHead',
    name: 'TableHead',
    component: () => import('@/views/tableHead/index.vue'),
    meta: { title: '数据表管理' }
  },
  {
    path: '/tableData',
    name: 'TableData',
    component: () => import('@/views/tableData/index.vue'),
    meta: { title: '表数据管理' }
  },
  {
    path: '/tableData/:tableId',
    name: 'TableDataWithId',
    component: () => import('@/views/tableData/index.vue'),
    meta: { title: '表数据管理' }
  },
  {
    path: '/debug-token',
    name: 'DebugToken',
    component: () => import('@/views/DebugToken.vue')
  },
  {
    path: '/qiankun-required',
    name: 'QiankunRequired',
    component: () => import('@/views/QiankunRequired.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue')
  }
]
const getBasePath = () => {
  const appBasePath = config.base || ''
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    const pathname = window.location.pathname
    // 从URL中解析路径段
    const segments = pathname.split('/').filter(segment => segment)
    // 确保appBasePath以/开头
    const normalizedAppBasePath = appBasePath.startsWith('/') ? appBasePath : `/${appBasePath}`
    // 如果有前一个segment，则与appBasePath组合
    if (segments.length > 0) {
      return `/${segments[0]}${normalizedAppBasePath}`
    } else {
      // 没有前一个segment，则直接使用appBasePath
      return normalizedAppBasePath || '/'
    }
  } else {
    return appBasePath
  }
}
// 创建路由实例
const router = createRouter({
  history: createWebHistory(getBasePath()),
  routes
})

// 路由守卫：检查是否允许在非 qiankun 模式下访问
router.beforeEach((to, from, next) => {
  // 检查是否配置为强制 qiankun 模式
  // 排除 qiankun-required 页面本身，避免无限重定向
  if (
    config.requireQiankun &&
    !qiankunWindow.__POWERED_BY_QIANKUN__ &&
    to.path !== '/qiankun-required'
  ) {
    // 非 qiankun 模式下，重定向到提示页面
    next({ path: '/qiankun-required' })
  } else {
    next()
  }
})

export default router
