// ==================== 统一导出入口 ====================
// 所有工具函数从这里统一导出，保持向后兼容

// 表单相关工具
export * from './form'

// 表管理相关工具
export * from './table'

// 从 form 中导出核心函数，确保与旧的 form-utils.js 兼容
import { buildFieldRules, createEmptyTableRow, getControlType } from './form'

export { buildFieldRules, createEmptyTableRow, getControlType }
