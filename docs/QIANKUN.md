# qiankun 子应用接入指南

## 概述

本项目已配置为支持 qiankun 微前端架构的子应用，可以独立运行，也可以作为子应用被主应用加载。

## 技术栈

- **qiankun**: 微前端框架
- **vite-plugin-qiankun**: Vite 插件，提供 qiankun 辅助函数

## 主应用配置示例

### 1. 主应用注册子应用

```js
// 主应用的 qiankun 配置
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'subApp-template',
    entry: '//localhost:5173/',
    container: '#subApp-container',
    activeRule: '/template',
    props: {
      // 传递给子应用的数据（格式为 props.data）
      data: {
        publicPath: '/template/',
        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
        tokenKey: 'tenantOperate-Admin-Token',
        loginInfo: {
          displayName: '系统管理员',
          permissionCodes: ['*:*:*'],
          appCode: 'tenantOperate'
        },
        title: '项目综合管控平台',
        onGlobalStateChange: (callback, fireImmediately) => {
          // 状态变化时的回调函数
        }
      }
    }
  }
])

start()
```

### 2. props.data 数据格式

主应用传递的数据格式如下：

```js
{
  "publicPath": "/tenantOperate/",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "tokenKey": "tenantOperate-Admin-Token",
  "loginInfo": {
    "displayName": "系统管理员",
    "permissionCodes": ["*:*:*"],
    "appCode": "tenantOperate"
  },
  "title": "项目综合管控平台",
  "onGlobalStateChange": (callback, fireImmediately) => {}
}
```

### 3. props.data 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `publicPath` | string | 是 | 子应用路由基础路径，如 `/tenantOperate/` |
| `token` | string | 是 | 用户登录 token |
| `tokenKey` | string | 是 | token 在请求头中的键名 |
| `loginInfo` | object | 是 | 用户登录信息 |
| `loginInfo.displayName` | string | - | 用户显示名称 |
| `loginInfo.permissionCodes` | array | - | 权限代码列表 |
| `loginInfo.appCode` | string | - | 应用代码 |
| `title` | string | - | 应用标题 |
| `onGlobalStateChange` | function | - | 状态变化监听函数 |

## 子应用功能

### 1. 自动接收并存储主应用数据

子应用在 `main.js` 的 `mount` 钩子中接收主应用传递的 `props.data`，并自动存储到 `useUserStore`：

```js
// src/store/user.js 中提供的方法
setToken(token)      // 设置 token
setLoginInfo(info)   // 设置登录信息
```

### 2. onGlobalStateChange 状态变化监听

子应用通过 `props.onGlobalStateChange` 监听主应用的状态变化：

```js
// src/main.js 中已实现
function setupGlobalStateListener(props) {
  const { onGlobalStateChange } = props.data || props

  if (typeof onGlobalStateChange === 'function') {
    onGlobalStateChange((newState) => {
      console.log('[qiankun] 主应用状态变化:', newState)
      // 自动更新 userStore 中的 token 和 loginInfo
      storePropsData({ data: newState })
    }, true)
  }
}
```

当主应用调用 `setGlobalState` 更新状态时，子应用会自动接收并更新 userStore 中的数据。

### 3. API 请求自动携带 token

`src/api/request.js` 已配置自动从 `useUserStore` 获取 token 并添加到请求头：

```js
// 请求头示例
{
  'Authorization': 'Bearer eyJ0eXAiOiJKV1Qi...'
}
```

### 4. 在组件中使用

```vue
<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// 获取 token
const token = computed(() => userStore.token)

// 获取登录信息
const loginInfo = computed(() => userStore.loginInfo)
const displayName = computed(() => loginInfo.value?.displayName || '')
const appCode = computed(() => loginInfo.value?.appCode || '')
</script>
```

## 路由配置

子应用的路由 base 会根据运行环境自动计算：

- **qiankun 模式下**：从 URL 路径中解析主应用前缀，结合 `config.base` 生成完整 base
- **独立运行模式**：使用环境变量 `VITE_APP_BASE_PATH` 或默认值 `/`

## 开发调试

### 方式一：独立运行（推荐用于页面开发）

```bash
npm run dev
```

访问 http://localhost:5173

### 方式二：qiankun 集成测试（推荐用于联调）

在主应用中配置子应用后，通过主应用路由访问子应用。

## 生产部署

### 1. 构建

```bash
npm run build
```

### 2. 主应用配置

```js
{
  name: 'subApp-template',
  entry: '//your-domain.com/',
  container: '#subApp-container',
  activeRule: '/template'
}
```

## 生命周期

子应用使用 `vite-plugin-qiankun` 提供的 `renderWithQiankun` 辅助函数，导出标准的 qiankun 生命周期：

- `bootstrap()` - 应用启动时调用
- `mount(props)` - 应用挂载时调用，接收主应用传递的 props
- `unmount()` - 应用卸载时调用，清空 userStore 中的数据

### mount 钩子处理流程

```js
mount(props) {
  // 1. 存储 qiankun 实例
  qiankunInstance = props

  // 2. 渲染应用（初始化 pinia 和 userStore）
  render(props)

  // 3. 存储主应用传递的数据到 userStore
  storePropsData(props)

  // 4. 设置全局状态变化监听
  setupGlobalStateListener(props)
}
```

### unmount 钩子清理

```js
unmount() {
  // 清空 userStore 中的数据
  userStore?.clearUser()
  qiankunInstance = null
}
```

## 实现原理

### vite-plugin-qiankun 辅助函数

项目使用 `vite-plugin-qiankun` 插件简化接入，主要提供：

- `renderWithQiankun()`: 自动处理 qiankun 生命周期注册
- `qiankunWindow`: 提供 `__POWERED_BY_QIANKUN__` 判断

### 路由 base 动态计算

`src/router/index.js` 中的 `getBasePath()` 函数：

1. 判断是否在 qiankun 环境下运行
2. qiankun 模式下从 URL 路径解析主应用前缀
3. 组合生成正确的路由 base 路径

## 样式隔离

qiankun 会自动为子应用的样式添加容器选择器前缀，实现样式隔离。

如果遇到样式问题，可以：

1. 使用 CSS scoped
2. 添加唯一前缀类名
3. 使用 CSS Modules

## 常见问题

### 1. 跨域问题

开发环境需要在 `vite.config.js` 中配置 CORS：

```js
server: {
  port: 5173,
  cors: true,
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
}
```

### 2. 路由 404

确保主应用的 `activeRule` 与子应用的 `publicPath` 匹配。

### 3. 静态资源加载失败

检查 `publicPath` 配置，确保与主应用传递给子应用的 `publicPath` 一致。
