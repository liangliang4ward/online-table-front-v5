// ==================== 数据库类型映射 ====================

// 数据库类型与表单组件映射
export const DB_TYPE_COMPONENT_MAP = {
  varchar: 'input',
  text: 'textarea',
  longtext: 'textarea',
  int: 'inputNumber',
  bigint: 'inputNumber',
  tinyint: 'inputNumber',
  date: 'datePicker',
  datetime: 'datetimePicker',
  decimal: 'inputNumber'
}

// 数据库类型与控件类型映射（用于推断）
export const DB_TYPE_CONTROL_MAP = {
  varchar: 'input',
  text: 'input',
  longtext: 'input',
  int: 'inputNumber',
  bigint: 'inputNumber',
  tinyint: 'inputNumber',
  date: 'datePicker',
  datetime: 'datetimePicker',
  decimal: 'inputNumber'
}

// ==================== 查询类型标签映射 ====================

// 查询类型标签
export const QUERY_TYPE_LABELS = {
  eq: '等于',
  like: '模糊',
  gt: '大于',
  lt: '小于',
  gte: '大于等于',
  lte: '小于等于',
  between: '区间',
  in: '多选'
}

// ==================== 关系类型 ====================

// 关系类型
export const RELATION_TYPES = {
  ONE_TO_ONE: 'one_to_one',
  ONE_TO_MANY: 'one_to_many'
}

// ==================== 枚举选项 ====================

// 订单状态选项
export const ORDER_STATUS_OPTIONS = [
  { label: '待付款', value: 0 },
  { label: '待发货', value: 1 },
  { label: '已发货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 }
]

// 用户状态选项
export const STATUS_OPTIONS = [
  { label: '禁用', value: 0 },
  { label: '启用', value: 1 }
]
