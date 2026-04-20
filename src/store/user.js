import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY_TOKEN = 'user_token'
const STORAGE_KEY_LOGIN_INFO = 'user_loginInfo'

export const useUserStore = defineStore('user', () => {
  // 从 sessionStorage 初始化数据
  const initToken = sessionStorage.getItem(STORAGE_KEY_TOKEN) || ''
  const initLoginInfoStr = sessionStorage.getItem(STORAGE_KEY_LOGIN_INFO)
  const initLoginInfo = initLoginInfoStr ? JSON.parse(initLoginInfoStr) : null

  const token = ref(initToken)
  const loginInfo = ref(initLoginInfo)

  /**
   * 设置 token
   */
  const setToken = newToken => {
    token.value = newToken
    sessionStorage.setItem(STORAGE_KEY_TOKEN, newToken)
  }

  /**
   * 获取 token
   */
  const getToken = () => {
    return token.value
  }

  /**
   * 设置登录信息
   */
  const setLoginInfo = info => {
    loginInfo.value = info
    sessionStorage.setItem(STORAGE_KEY_LOGIN_INFO, JSON.stringify(info))
  }

  /**
   * 获取登录信息
   */
  const getLoginInfo = () => {
    return loginInfo.value
  }

  /**
   * 清空用户数据
   */
  const clearUser = () => {
    token.value = ''
    loginInfo.value = null
    sessionStorage.removeItem(STORAGE_KEY_TOKEN)
    sessionStorage.removeItem(STORAGE_KEY_LOGIN_INFO)
  }

  return {
    setToken,
    getToken,
    setLoginInfo,
    getLoginInfo,
    clearUser
  }
})
