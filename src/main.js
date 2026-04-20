import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// 使用自定义命名空间的 Element Plus 样式，避免与主应用样式冲突
import '@/styles/element/index.scss'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from '@/App.vue'
import router from '@/router'
import * as directives from '@/directives'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import { useUserStore } from '@/store/user'
import { setTokenGetter, setAppCodeGetter } from '@/api/request'
import { setupErrorHandler } from '@/utils/error-handler'

// 存储 qiankun 实例，用于更新全局状态
let qiankunInstance = null
// user store 实例
let userStore = null

/**
 * 存储主应用传递的数据
 */
function storePropsData(props) {
  if (!props) return

  const { token, loginInfo } = props.data || props

  // 存储到 user store
  if (token !== undefined) {
    userStore?.setToken(token)
  }
  if (loginInfo) {
    userStore?.setLoginInfo(loginInfo)
  }
}

/**
 * 设置全局状态变化监听
 */
let globalActions = null
function setupGlobalStateListener(props) {
  globalActions = props
  globalActions.onGlobalStateChange(state => {
    storePropsData(state)
  }, true)
}

/**
 * 渲染应用
 */
function render(props) {
  const { container } = props || {}

  const app = createApp(App)

  // 注册 Element Plus 图标全局组件
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  const pinia = createPinia()

  app.use(pinia)

  // 初始化 user store（必须在 app.use(pinia) 之后调用）
  userStore = useUserStore()

  // 设置 token 获取回调
  setTokenGetter(() => userStore?.getToken() || '')
  setAppCodeGetter(() => userStore?.getLoginInfo()?.appCode || '')

  // 设置全局错误处理
  setupErrorHandler(app)

  app.use(ElementPlus, {
    locale: zhCn,
    namespace: 'sub-el'
  })
  app.use(router)

  // 注册全局指令
  Object.keys(directives).forEach(key => {
    app.directive(key, directives[key])
  })

  app.mount(container ? container.querySelector('#subApp') : '#subApp')

  return app
}

/**
 * 初始化 qiankun
 */
const initQianKun = () => {
  renderWithQiankun({
    bootstrap() {
      console.log('[subApp] bootstraped')
    },
    mount(props) {
      console.log('[subApp] mount with props:', props)

      // 存储 qiankun 实例
      qiankunInstance = props

      // 然后存储主应用传递的数据（此时 userStore 已初始化）
      storePropsData(props)
      // 先渲染应用（初始化 pinia 和 userStore）
      render(props)

      // 设置全局状态变化监听
      setupGlobalStateListener(props)
    },
    unmount() {
      console.log('[subApp] unmount')
      // 清空 user store 数据
      userStore?.clearUser()
      qiankunInstance = null
    }
  })
}

// 根据运行环境初始化
qiankunWindow.__POWERED_BY_QIANKUN__ ? initQianKun() : render()
