import request from '@/api/request'
import { ElMessage } from 'element-plus'

/**
 * 获取当前用户信息
 * @param {Object} config - 请求配置
 * @param {string} config.appCode - 应用编码
 * @returns {Promise}
 */
export function getCurrentUser(config = {}) {
  const headers = {}
  if (config.appCode) {
    headers['X-APP-CODE'] = config.appCode
  }
  return request.get('/uic/getCurrentUser', { headers })
}

/**
 * 获取当前用户信息（带消息提示）
 * @param {Object} config - 请求配置
 * @param {string} config.appCode - 应用编码
 * @returns {Promise} 返回用户数据
 */
export async function fetchUserInfo(config = {}) {
  try {
    const response = await getCurrentUser(config)
    if (response.success && response.data) {
      return response.data
    } else {
      ElMessage.error(response.msg || '获取用户信息失败')
      throw new Error(response.msg || '获取用户信息失败')
    }
  } catch (error) {
    if (!error.message?.includes('获取用户信息')) {
      ElMessage.error('请求失败：' + (error.message || '未知错误'))
    }
    throw error
  }
}
