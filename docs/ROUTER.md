# 路由配置说明

## 当前路由

| 路径 | 名称 | 组件 | 说明 |
|------|------|------|------|
| `/` | - | - | 重定向到 /index |
| `/index` | Index | views/index.vue | 首页 |
| `/demo` | Demo | views/demo.vue | Demo 页面 |
| `/:pathMatch(.*)*` | NotFound | views/404.vue | 404 页面 |

## 添加新路由

在 `src/router/index.js` 中添加：

```js
const routes = [
  // 现有路由...
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/about.vue')
  }
]
```

## 路由跳转

```vue
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 方式 1: push
router.push('/demo')

// 方式 2: 命名路由
router.push({ name: 'Demo' })

// 方式 3: 带参数
router.push({ path: '/user/123' })
</script>
```

```vue
<template>
  <!-- 模板中使用 router-link -->
  <router-link to="/demo">前往 Demo</router-link>
</template>
```

## 路由参数

```js
// 定义路由
{
  path: '/user/:id',
  name: 'User',
  component: () => import('@/views/user.vue')
}

// 获取参数
import { useRoute } from 'vue-router'
const route = useRoute()
const userId = route.params.id
```

## 路由守卫

```js
// 在 router/index.js 中
router.beforeEach((to, from, next) => {
  // 登录检查等
  next()
})
```

## 修改基础路径

在 `.env.development` 或 `.env.production` 中修改：

```
VITE_BASE_PATH=/subApp/
```
