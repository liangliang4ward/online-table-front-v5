/**
 * 通用 hooks
 */
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 窗口大小变化 hook
 */
export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  const updateSize = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', updateSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  return { width, height }
}

/**
 * 加载状态 hook
 */
export function useLoading() {
  const loading = ref(false)
  const error = ref(null)

  const wrap = async promise => {
    loading.value = true
    error.value = null
    try {
      const result = await promise
      return result
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, wrap }
}
