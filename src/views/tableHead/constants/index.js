// 表类型选项
export const TABLE_TYPE_OPTIONS = [
  { label: '单表', value: 0 },
  { label: '主表', value: 1 },
  { label: '附表', value: 2 }
]

// 同步状态选项
export const SYNC_STATUS_OPTIONS = [
  { label: '已同步', value: 'Y' },
  { label: '未同步', value: 'N' }
]

// 数据库类型选项（MySQL字段类型）
export const DB_TYPE_OPTIONS = [
  { label: 'varchar', value: 'varchar' },
  { label: 'int', value: 'int' },
  { label: 'bigint', value: 'bigint' },
  { label: 'tinyint', value: 'tinyint' },
  { label: 'decimal', value: 'decimal' },
  { label: 'date', value: 'date' },
  { label: 'datetime', value: 'datetime' },
  { label: 'text', value: 'text' },
  { label: 'longtext', value: 'longtext' }
]

// 索引类型选项
export const INDEX_TYPE_OPTIONS = [
  { label: '普通索引', value: 'normal' },
  { label: '唯一索引', value: 'unique' }
]

// ID类型选项
export const ID_TYPE_OPTIONS = [
  { label: 'int', value: 'int' },
  { label: 'bigint', value: 'bigint' },
  { label: 'varchar', value: 'varchar' }
]

// 控件类型选项
export const CONTROL_TYPE_OPTIONS = [
  { label: '文本框', value: 'input' },
  { label: '密码框', value: 'password' },
  { label: '文本域', value: 'textarea' },
  { label: '数字输入', value: 'inputNumber' },
  { label: '下拉选择(单选)', value: 'select' },
  { label: '下拉选择(多选)', value: 'selectMultiple' },
  { label: '单选框', value: 'radio' },
  { label: '复选框', value: 'checkbox' },
  { label: '日期选择', value: 'datePicker' },
  { label: '日期时间选择', value: 'datetimePicker' },
  { label: '文件上传', value: 'upload' },
  { label: '富文本', value: 'richText' }
]

// 查询方式选项
export const QUERY_TYPE_OPTIONS = [
  { label: '不查询', value: 'none' },
  { label: '等于', value: 'eq' },
  { label: '模糊查询', value: 'like' },
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
  { label: '大于等于', value: 'gte' },
  { label: '小于等于', value: 'lte' },
  { label: '区间', value: 'between' },
  { label: '多选', value: 'in' }
]

// 数据来源类型选项
export const DATA_SOURCE_TYPE_OPTIONS = [
  { label: '静态选项', value: 'static' },
  { label: '字典', value: 'dictionary' },
  { label: '接口', value: 'api' }
]

// 系统字段
export const SYSTEM_FIELDS = ['create_time', 'update_time', 'delete_flag']

// 固定名称字段
export const FIXED_NAME_FIELDS = ['id', 'create_by', 'update_by', ...SYSTEM_FIELDS]

// 关联类型选项（移除多对一）
export const RELATION_TYPE_OPTIONS = [
  { label: '一对多', value: 'one_to_many' },
  { label: '一对一', value: 'one_to_one' }
]

// 表单列数选项
export const FORM_COLUMNS_OPTIONS = [
  { label: '1列', value: 1 },
  { label: '2列', value: 2 },
  { label: '3列', value: 3 },
  { label: '4列', value: 4 }
]

// 预设校验规则
export const PRESET_VALIDATION_RULES = [
  {
    label: '邮箱',
    value: 'email',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    message: '请输入正确的邮箱地址'
  },
  { label: '手机号', value: 'phone', pattern: '^1[3-9]\\d{9}$', message: '请输入正确的手机号' },
  {
    label: '身份证号',
    value: 'idCard',
    pattern: '(^\\d{15}$)|(^\\d{18}$)|(^\\d{17}(\\d|X|x)$)',
    message: '请输入正确的身份证号'
  },
  {
    label: 'URL',
    value: 'url',
    pattern: '^(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*$',
    message: '请输入正确的URL地址'
  },
  { label: '数字', value: 'number', pattern: '^-?\\d+(\\.\\d+)?$', message: '请输入数字' },
  { label: '整数', value: 'integer', pattern: '^-?\\d+$', message: '请输入整数' },
  { label: '正整数', value: 'positiveInteger', pattern: '^[1-9]\\d*$', message: '请输入正整数' },
  { label: '中文', value: 'chinese', pattern: '^[\\u4e00-\\u9fa5]+$', message: '请输入中文' }
]

// 布局类型选项
export const LAYOUT_TYPE_OPTIONS = [
  { label: '默认排列', value: 'default' },
  { label: '单独一行', value: 'fullRow' },
  { label: '换行', value: 'newLine' }
]

// 脱敏类型选项
export const DESENSITIZE_TYPE_OPTIONS = [
  { label: '不脱敏', value: 'none' },
  { label: '手机号', value: 'phone' },
  { label: '身份证号', value: 'idCard' },
  { label: '银行卡号', value: 'bankCard' },
  { label: '邮箱', value: 'email' },
  { label: '姓名', value: 'name' },
  { label: '地址', value: 'address' },
  { label: '自定义', value: 'custom' }
]

// 数据库类型标签映射
export const TABLE_TYPE_LABELS = {
  0: '单表',
  1: '主表',
  2: '附表'
}

// 表类型标签颜色映射
export const TABLE_TYPE_TAG_TYPES = {
  0: 'info',
  1: 'primary',
  2: 'success'
}

// 同步状态标签颜色映射
export const SYNC_STATUS_TAG_TYPES = {
  Y: 'success',
  N: 'warning'
}
