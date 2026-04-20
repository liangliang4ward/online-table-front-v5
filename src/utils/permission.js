import { useUserStore } from '@/store/user'

/**
 * 检查单个权限
 * @param {string} requiredPermission - 需要的权限，如 'read:user:readUser'
 * @param {string[]} userPermissions - 用户拥有的权限列表
 * @returns {boolean}
 */
function checkSinglePermission(requiredPermission, userPermissions) {
  if (!userPermissions || userPermissions.length === 0) {
    return false
  }

  // 检查是否有通配符权限 [*.*.*]
  if (userPermissions.includes('*.*.*')) {
    return true
  }

  // 精确匹配
  if (userPermissions.includes(requiredPermission)) {
    return true
  }

  // 通配符匹配
  const requiredParts = requiredPermission.split(':')

  for (const userPerm of userPermissions) {
    const userParts = userPerm.split(':')

    // 长度必须一致才能匹配
    if (userParts.length !== requiredParts.length) {
      continue
    }

    // 逐段匹配，* 可以匹配任意段
    let match = true
    for (let i = 0; i < requiredParts.length; i++) {
      if (userParts[i] !== '*' && userParts[i] !== requiredParts[i]) {
        match = false
        break
      }
    }

    if (match) {
      return true
    }
  }

  return false
}

/**
 * 检查权限
 * @param {string|string[]} permissions - 需要的权限，可以是单个权限或权限数组
 * @param {Object} options - 选项
 * @param {string} options.logic - 多个权限时的校验逻辑，'and' 表示需要所有权限，'or' 表示需要任意一个权限
 * @returns {boolean} 是否有权限
 */
export function checkPermission(permissions, options = {}) {
  const { logic = 'or' } = options

  // 获取用户 store
  const userStore = useUserStore()
  const loginInfo = userStore.getLoginInfo()

  // 获取用户权限列表
  const userPermissions = loginInfo?.permissionCodes || []

  // 如果是字符串，转为数组
  const permissionList = Array.isArray(permissions) ? permissions : [permissions]

  if (permissionList.length === 0) {
    return true
  }

  // 根据逻辑判断
  if (logic === 'and') {
    // 需要所有权限
    return permissionList.every(perm => checkSinglePermission(perm, userPermissions))
  } else {
    // 只需要任意一个权限（默认）
    return permissionList.some(perm => checkSinglePermission(perm, userPermissions))
  }
}

/**
 * 检查权限（指令方式）
 * @param {string|string[]} permissions - 需要的权限
 * @returns {boolean}
 */
export function hasPermission(permissions) {
  return checkPermission(permissions)
}

/**
 * 权限校验工具
 */
export const permissionUtil = {
  checkPermission,
  hasPermission,
  check: checkPermission
}

export default permissionUtil
