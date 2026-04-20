# API 接口规范

## Axios 封装

位于 `src/api/request.js`，已配置：
- 基础路径（从环境变量读取）
- 超时时间
- 请求/响应拦截器

## 创建新的 API 模块

```js
// src/api/user.js
import request from './request'

export function getUserInfo(id) {
  return request({
    url: `/user/${id}`,
    method: 'get'
  })
}

export function updateUser(data) {
  return request({
    url: '/user',
    method: 'put',
    data
  })
}
```

## 在组件中使用

```vue
<script setup>
import { getUserInfo } from '@/api/user'
import { useLoading } from '@/hooks'

const { wrap } = useLoading()

const fetchUser = async () => {
  const user = await wrap(getUserInfo(1))
  console.log(user)
}
</script>
```

## 拦截器扩展

### 请求头添加 Token

```js
// request.js
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 响应错误处理

```js
// request.js
request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // 跳转登录
    }
    return Promise.reject(error)
  }
)
```

## 环境变量配置

| 环境 | 变量 | 默认值 |
|------|------|--------|
| 开发 | `VITE_API_BASE` | /api |
| 生产 | `VITE_API_BASE` | /api |
