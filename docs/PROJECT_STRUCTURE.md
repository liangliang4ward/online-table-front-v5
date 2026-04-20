# 目录结构说明

## 核心目录

### `src/api/`
API 接口层，负责与后端通信。

```
src/api/
├── request.js      # Axios 实例封装（拦截器、默认配置）
└── user.js         # 用户相关接口（示例）
```

### `src/assets/`
静态资源文件（图片、字体等），会被 Vite 处理。

### `src/components/`
公共组件，可在多个页面复用。

```
src/components/
├── common/         # 通用业务组件
└── base/           # 基础 UI 组件封装
```

### `src/config/`
应用配置，从环境变量读取配置项。

### `src/directives/`
自定义 Vue 指令。

```js
// 使用示例
<div v-loading="isLoading"></div>
<div v-permission="['admin']"></div>
```

### `src/hooks/`
组合式函数（Composables），封装可复用的逻辑。

```js
// 使用示例
import { useWindowSize, useLoading } from '@/hooks'

const { width, height } = useWindowSize()
const { loading, wrap } = useLoading()
```

### `src/router/`
Vue Router 路由配置。

### `src/store/`
Pinia 状态管理。

```js
// 使用示例
import { useAppStore } from '@/store'

const appStore = useAppStore()
appStore.setTitle('新标题')
```

### `src/styles/`
全局样式文件。

### `src/utils/`
工具函数。

```js
// 使用示例
import { formatDate, debounce } from '@/utils'

const today = formatDate(new Date())
```

### `src/views/`
页面级组件，对应路由。

## 配置文件

| 文件 | 说明 |
|------|------|
| `.env` | 公共环境变量 |
| `.env.development` | 开发环境配置 |
| `.env.production` | 生产环境配置 |
| `vite.config.js` | Vite 配置 |
| `src/config/index.js` | 应用配置 |
