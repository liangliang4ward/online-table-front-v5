import { checkPermission } from '@/utils/permission'

/**
 * 权限指令
 * 用法：v-permission="['read:user:readUser']"
 *       v-permission="'read:user:readUser'"
 *       v-permission="['read:user:readUser', 'write:user:updateUser']"
 */
export default {
  mounted(el, binding) {
    const { value } = binding
    const hasPermission = checkPermission(value)

    if (!hasPermission) {
      // 没有权限，移除元素
      el.parentNode?.removeChild(el)
    }
  },
  updated(el, binding) {
    const { value } = binding
    const hasPermission = checkPermission(value)

    if (!hasPermission) {
      // 没有权限，移除元素
      el.parentNode?.removeChild(el)
    }
  }
}
