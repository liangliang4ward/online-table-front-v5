import { ref, reactive, computed, watch } from 'vue'
import { CONTROL_TYPE_OPTIONS } from '../constants'
import {
  getDefaultControlType,
  getDefaultQueryType,
  getAvailableControlTypes,
  getAvailableQueryTypes,
  needOptionConfig,
  needDateFormatConfig,
  needFileConfig,
  isTextFieldType,
  isNumberFieldType,
  getAvailableDateFormatOptions
} from '../utils'
import { PRESET_VALIDATION_RULES } from '../constants'

/**
 * 字段配置逻辑
 * @param {Object} options - 配置选项
 * @param {Object} options.formData - 表表单数据（包含fields数组）
 * @returns {Object} 字段配置相关的状态和方法
 */
export function useFieldConfig(options = {}) {
  const { formData } = options

  // 状态变量
  const fieldConfigDialogVisible = ref(false)
  const currentFieldIndex = ref(-1)
  const fieldConfigFormRef = ref(null)
  const fieldConfigActiveTab = ref('control')

  // 当前正在配置的字段
  const currentConfigField = ref(null)

  // 字段配置表单数据
  const fieldConfigFormData = reactive({
    controlType: 'input',
    queryType: 'none',
    isShowList: true,
    isShowForm: true,
    isEditable: true,
    isAddable: true,
    isShowInAdd: true,
    layoutType: 'default',
    isSensitiveField: false,
    desensitizeType: 'none',
    customDesensitize: {
      startIndex: 0,
      endIndex: 0,
      maskChar: '*'
    },
    controlConfig: {
      dataSourceType: 'static',
      dictionaryCode: '',
      options: [],
      apiUrl: '',
      apiMethod: 'GET',
      apiParams: {},
      dateFormat: '',
      multiple: false,
      limit: 1,
      fileTypes: [],
      maxSize: 10
    },
    validationRules: {
      required: false,
      minLength: null,
      maxLength: null,
      min: null,
      max: null,
      pattern: '',
      presetRule: '',
      message: ''
    }
  })

  // 当前字段可用的控件类型
  const availableControlTypes = computed(() => {
    if (!currentConfigField.value) {
      return CONTROL_TYPE_OPTIONS
    }
    return getAvailableControlTypes(currentConfigField.value.dbType)
  })

  // 当前字段可用的查询方式
  const availableQueryTypes = computed(() => {
    // 敏感字段只能选择"不查询"
    if (fieldConfigFormData.isSensitiveField) {
      return [{ label: '不查询', value: 'none' }]
    }
    return getAvailableQueryTypes(fieldConfigFormData.controlType)
  })

  // 检查是否需要显示选项配置
  const needOptionConfigComputed = computed(() => {
    return needOptionConfig(fieldConfigFormData.controlType)
  })

  // 检查是否需要显示日期格式配置
  const needDateFormatConfigComputed = computed(() => {
    return needDateFormatConfig(fieldConfigFormData.controlType)
  })

  // 检查是否需要显示文件配置
  const needFileConfigComputed = computed(() => {
    return needFileConfig(fieldConfigFormData.controlType)
  })

  // 检查是否为文本类型字段
  const isTextFieldTypeComputed = computed(() => {
    return isTextFieldType(fieldConfigFormData.controlType)
  })

  // 检查是否为数字类型字段
  const isNumberFieldTypeComputed = computed(() => {
    return isNumberFieldType(fieldConfigFormData.controlType)
  })

  // 获取可用的日期格式选项
  const availableDateFormatOptions = computed(() => {
    return getAvailableDateFormatOptions(currentConfigField.value?.dbType)
  })

  // 监听控件类型变化，自动调整查询方式
  const watchControlType = () => {
    const available = availableQueryTypes.value
    const currentQueryType = fieldConfigFormData.queryType

    // 如果当前查询方式不再可用，自动切换到第一个可用的
    const isAvailable = available.some(t => t.value === currentQueryType)
    if (!isAvailable && available.length > 0) {
      fieldConfigFormData.queryType = available[0].value
    }
  }

  // 监听敏感字段变化，自动设置相关属性
  const watchSensitiveField = isSensitive => {
    if (isSensitive) {
      // 当设置为敏感字段时，自动设置：
      // 1. 列表显示 = false
      // 2. 新增可录 = false
      // 3. 新增显示 = false
      // 4. 查询方式 = "none"
      fieldConfigFormData.isShowList = false
      fieldConfigFormData.isAddable = false
      fieldConfigFormData.isShowInAdd = false
      fieldConfigFormData.queryType = 'none'
    }
  }

  // 监听控件类型变化
  watch(() => fieldConfigFormData.controlType, watchControlType)

  // 监听敏感字段变化
  watch(() => fieldConfigFormData.isSensitiveField, watchSensitiveField)

  // 打开字段配置对话框
  const openFieldConfigDialog = (row, index) => {
    currentFieldIndex.value = index
    currentConfigField.value = row

    // 重置到控件配置tab
    fieldConfigActiveTab.value = 'control'

    // 初始化表单数据
    fieldConfigFormData.controlType = row.controlType || getDefaultControlType(row.dbType)
    fieldConfigFormData.queryType =
      row.queryType || (row.isQuery ? getDefaultQueryType(row.dbType) : 'none')

    // 显示权限配置
    fieldConfigFormData.isShowList = row.isShowList !== false
    fieldConfigFormData.isShowForm = row.isShowForm !== false
    fieldConfigFormData.isEditable = row.isEditable !== false
    fieldConfigFormData.isAddable = row.isAddable !== false
    fieldConfigFormData.isShowInAdd = row.isShowInAdd !== false

    // 布局配置
    fieldConfigFormData.layoutType = row.layoutType || 'default'

    // 敏感字段配置（密码等字段，列表不展示、数据不返回）
    fieldConfigFormData.isSensitiveField = row.isSensitiveField === true

    // 脱敏配置
    fieldConfigFormData.desensitizeType = row.desensitizeType || 'none'
    const customDesensitize = row.customDesensitize || {}
    fieldConfigFormData.customDesensitize = {
      startIndex: customDesensitize.startIndex ?? 0,
      endIndex: customDesensitize.endIndex ?? 0,
      maskChar: customDesensitize.maskChar || '*'
    }

    // 复制 controlConfig
    const controlConfig = row.controlConfig || {}
    fieldConfigFormData.controlConfig = {
      dataSourceType: controlConfig.dataSourceType || 'static',
      dictionaryCode: controlConfig.dictionaryCode || '',
      options: controlConfig.options ? [...controlConfig.options] : [],
      apiUrl: controlConfig.apiUrl || '',
      apiMethod: controlConfig.apiMethod || 'GET',
      apiParams: controlConfig.apiParams ? { ...controlConfig.apiParams } : {},
      dateFormat: controlConfig.dateFormat || '',
      multiple: controlConfig.multiple || false,
      limit: controlConfig.limit || 1,
      fileTypes: controlConfig.fileTypes ? [...controlConfig.fileTypes] : [],
      maxSize: controlConfig.maxSize || 10
    }

    // 复制 validationRules
    const validationRules = row.validationRules || {}
    fieldConfigFormData.validationRules = {
      required: validationRules.required || false,
      minLength: validationRules.minLength ?? null,
      maxLength: validationRules.maxLength ?? null,
      min: validationRules.min ?? null,
      max: validationRules.max ?? null,
      pattern: validationRules.pattern || '',
      presetRule: validationRules.presetRule || '',
      message: validationRules.message || ''
    }

    fieldConfigDialogVisible.value = true
  }

  // 保存字段配置
  const handleFieldConfigSubmit = async () => {
    const valid = await fieldConfigFormRef.value?.validate().catch(() => false)
    if (!valid) return

    if (currentFieldIndex.value >= 0) {
      const field =
        formData.value?.fields[currentFieldIndex.value] || formData.fields[currentFieldIndex.value]
      field.controlType = fieldConfigFormData.controlType
      field.queryType = fieldConfigFormData.queryType
      field.isQuery = fieldConfigFormData.queryType !== 'none'

      // 显示权限配置
      field.isShowList = fieldConfigFormData.isShowList
      field.isShowForm = fieldConfigFormData.isShowForm
      field.isEditable = fieldConfigFormData.isEditable
      field.isAddable = fieldConfigFormData.isAddable
      field.isShowInAdd = fieldConfigFormData.isShowInAdd

      // 布局配置
      field.layoutType = fieldConfigFormData.layoutType

      // 敏感字段配置
      field.isSensitiveField = fieldConfigFormData.isSensitiveField

      // 脱敏配置
      field.desensitizeType = fieldConfigFormData.desensitizeType
      field.customDesensitize = { ...fieldConfigFormData.customDesensitize }

      field.controlConfig = { ...fieldConfigFormData.controlConfig }
      field.validationRules = { ...fieldConfigFormData.validationRules }
    }

    fieldConfigDialogVisible.value = false
  }

  // 添加选项
  const addOption = () => {
    fieldConfigFormData.controlConfig.options.push({
      label: '',
      value: ''
    })
  }

  // 删除选项
  const removeOption = index => {
    fieldConfigFormData.controlConfig.options.splice(index, 1)
  }

  // 预设规则变更处理
  const handlePresetRuleChange = val => {
    const rule = PRESET_VALIDATION_RULES.find(r => r.value === val)
    if (rule) {
      fieldConfigFormData.validationRules.pattern = rule.pattern
      if (!fieldConfigFormData.validationRules.message) {
        fieldConfigFormData.validationRules.message = rule.message
      }
    }
  }

  return {
    // 状态
    fieldConfigDialogVisible,
    currentFieldIndex,
    fieldConfigFormRef,
    fieldConfigActiveTab,
    currentConfigField,
    fieldConfigFormData,

    // 计算属性
    availableControlTypes,
    availableQueryTypes,
    needOptionConfig: needOptionConfigComputed,
    needDateFormatConfig: needDateFormatConfigComputed,
    needFileConfig: needFileConfigComputed,
    isTextFieldType: isTextFieldTypeComputed,
    isNumberFieldType: isNumberFieldTypeComputed,
    availableDateFormatOptions,

    // 方法
    openFieldConfigDialog,
    handleFieldConfigSubmit,
    addOption,
    removeOption,
    handlePresetRuleChange
  }
}
