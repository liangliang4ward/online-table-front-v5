import axios from 'axios'
import { ElMessage } from 'element-plus'
import config from '@/config'

const request = axios.create({
  baseURL: config.apiBase,
  timeout: config.timeout
})

// 获取 token 的回调函数
let getTokenFn = null
// 获取 appCode 的回调函数
let getAppCodeFn = null

export function setTokenGetter(fn) {
  getTokenFn = fn
}

export function setAppCodeGetter(fn) {
  getAppCodeFn = fn
}

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从回调函数获取 token
    const token = getTokenFn ? getTokenFn() : ''
    const appCode = getAppCodeFn ? getAppCodeFn() : ''

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    if (appCode) {
      config.headers['X-APP-CODE'] = appCode
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data

    // 统一业务错误处理
    if (res.success === false) {
      ElMessage.error(res.msg || '操作失败')
      return Promise.reject(new Error(res.msg || '操作失败'))
    }

    return res
  },
  error => {
    // HTTP 错误处理
    const message = error.response?.data?.msg || error.message || '网络请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request
