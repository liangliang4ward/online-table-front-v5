// ==================== 统一导出入口 ====================
// 所有常量从这里统一导出，保持向后兼容

// 表单相关常量
export * from './form'

// 表管理相关常量
export * from './table'

// 导入需要合并导出的常量
import { CONTROL_TYPE_OPTIONS, TABLE_TYPE_LABELS } from './table'

// 重新导出，确保与旧的 form-constants.js 兼容
export { CONTROL_TYPE_OPTIONS, TABLE_TYPE_LABELS }
