/**
 * 自定义指令目录
 */
import permissionDirective from './permission'

// v-loading 指令
export const loading = {
  mounted(el, binding) {
    if (binding.value) {
      el.style.position = 'relative'
      el.style.pointerEvents = 'none'
    } else {
      el.style.position = ''
      el.style.pointerEvents = ''
    }
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      el.style.position = binding.value ? 'relative' : ''
      el.style.pointerEvents = binding.value ? 'none' : ''
    }
  }
}

// v-permission 指令（权限控制）
export const permission = permissionDirective
