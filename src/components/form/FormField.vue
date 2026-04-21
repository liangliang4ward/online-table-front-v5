<script setup>
import { computed } from 'vue'
import RichTextEditor from '@/components/RichTextEditor.vue'
import {
  getControlType,
  getFieldOptions,
  getFieldMaxLength,
  isFieldEditable,
  getOptionLabel
} from '@/utils'

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  modelValue: {
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default'
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const controlType = computed(() => getControlType(props.field))
const options = computed(() => getFieldOptions(props.field))
const maxLength = computed(() => getFieldMaxLength(props.field))
const isDisabled = computed(() => {
  if (props.disabled) return true
  if (props.readonly) return true
  return !isFieldEditable(props.field, props.isEdit)
})

const fieldName = computed(() => {
  return props.field.dbFieldNameAlias || props.field.dbFieldName
})

const placeholder = computed(() => {
  return `请${['select', 'selectMultiple', 'radio', 'checkbox', 'datePicker', 'datetimePicker', 'upload'].includes(controlType.value) ? '选择' : '输入'}${props.field.dbFieldTxt || fieldName.value}`
})

const dateFormat = computed(() => {
  return (
    props.field.controlConfig?.dateFormat ||
    (controlType.value === 'datetimePicker' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
  )
})

const updateValue = value => {
  emit('update:modelValue', value)
}

// 获取显示值（只读模式下使用）
const displayValue = computed(() => {
  const value = props.modelValue

  if (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return '-'
  }

  // 下拉单选/单选框显示标签
  if (['select', 'radio'].includes(controlType.value)) {
    const option = options.value.find(opt => opt.value === value)
    return option?.label || value
  }

  // 下拉多选/复选框显示标签列表
  if (['selectMultiple', 'checkbox'].includes(controlType.value)) {
    if (Array.isArray(value) && value.length > 0) {
      return value
        .map(v => {
          const option = options.value.find(opt => opt.value === v)
          return option?.label || v
        })
        .join(', ')
    }
    return '-'
  }

  // 文件上传显示文件数量
  if (controlType.value === 'upload') {
    if (Array.isArray(value)) {
      return value.length > 0 ? `${value.length} 个文件` : '无文件'
    }
    return '无文件'
  }

  return value
})
</script>

<template>
  <!-- 只读模式 - 显示值 -->
  <template v-if="readonly">
    <!-- 下拉多选/复选框用标签显示 -->
    <div v-if="['selectMultiple', 'checkbox'].includes(controlType)" class="multi-select-display">
      <ElTag v-for="val in modelValue || []" :key="val" size="small" class="mr-2">
        {{ getOptionLabel(val, field) }}
      </ElTag>
      <span v-if="!modelValue || modelValue.length === 0">-</span>
    </div>
    <!-- 文件上传显示文件数量 -->
    <div v-else-if="controlType === 'upload'" class="upload-readonly">
      {{ displayValue }}
    </div>
    <!-- 富文本显示HTML内容 -->
    <RichTextEditor
      v-else-if="controlType === 'richText'"
      :model-value="modelValue"
      :placeholder="placeholder"
      disabled
      :height="250"
    />
    <!-- 其他类型用禁用的输入框显示 -->
    <ElInput
      v-else-if="['input', 'textarea'].includes(controlType)"
      :model-value="displayValue"
      :placeholder="placeholder"
      disabled
      :type="controlType === 'textarea' ? 'textarea' : 'text'"
      :rows="controlType === 'textarea' ? 3 : undefined"
    />
    <ElInputNumber
      v-else-if="controlType === 'inputNumber'"
      :model-value="modelValue"
      :placeholder="placeholder"
      disabled
      :controls="false"
      style="width: 100%"
    />
    <ElSelect
      v-else-if="controlType === 'select'"
      :model-value="modelValue"
      :placeholder="placeholder"
      disabled
      style="width: 100%"
    >
      <ElOption
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </ElSelect>
    <ElRadioGroup v-else-if="controlType === 'radio'" :model-value="modelValue" disabled>
      <ElRadio v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </ElRadio>
    </ElRadioGroup>
    <ElDatePicker
      v-else-if="controlType === 'datePicker'"
      :model-value="modelValue"
      type="date"
      :placeholder="placeholder"
      disabled
      :format="dateFormat"
      :value-format="dateFormat"
      style="width: 100%"
    />
    <ElDatePicker
      v-else-if="controlType === 'datetimePicker'"
      :model-value="modelValue"
      type="datetime"
      :placeholder="placeholder"
      disabled
      :format="dateFormat"
      :value-format="dateFormat"
      style="width: 100%"
    />
    <!-- 默认用输入框 -->
    <ElInput v-else :model-value="displayValue" :placeholder="placeholder" disabled />
  </template>

  <!-- 编辑模式 -->
  <template v-else>
    <!-- 文本框 -->
    <ElInput
      v-if="controlType === 'input'"
      :model-value="modelValue"
      @update:model-value="updateValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :maxlength="maxLength"
      :show-word-limit="maxLength !== null"
    />

    <!-- 密码框 -->
    <ElInput
      v-else-if="controlType === 'password'"
      :model-value="modelValue"
      @update:model-value="updateValue"
      type="password"
      show-password
      :placeholder="placeholder"
      :disabled="isDisabled"
      :maxlength="maxLength"
      :show-word-limit="maxLength !== null"
    />

    <!-- 文本域 -->
    <ElInput
      v-else-if="controlType === 'textarea'"
      :model-value="modelValue"
      @update:model-value="updateValue"
      type="textarea"
      :rows="3"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :maxlength="maxLength"
      :show-word-limit="maxLength !== null"
    />

    <!-- 数字输入 -->
    <ElInputNumber
      v-else-if="controlType === 'inputNumber'"
      :model-value="modelValue"
      @update:model-value="updateValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :controls="false"
      :size="size"
      style="width: 100%"
    />

    <!-- 下拉单选 -->
    <ElSelect
      v-else-if="controlType === 'select'"
      :model-value="modelValue"
      @update:model-value="updateValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      clearable
      :size="size"
      style="width: 100%"
    >
      <ElOption
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </ElSelect>

    <!-- 下拉多选 -->
    <ElSelect
      v-else-if="controlType === 'selectMultiple'"
      :model-value="modelValue"
      @update:model-value="updateValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      multiple
      clearable
      :size="size"
      style="width: 100%"
    >
      <ElOption
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </ElSelect>

    <!-- 单选框 -->
    <ElRadioGroup
      v-else-if="controlType === 'radio'"
      :model-value="modelValue"
      @update:model-value="updateValue"
      :disabled="isDisabled"
      :size="size"
    >
      <ElRadio v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </ElRadio>
    </ElRadioGroup>

    <!-- 复选框 -->
    <ElCheckboxGroup
      v-else-if="controlType === 'checkbox'"
      :model-value="modelValue"
      @update:model-value="updateValue"
      :disabled="isDisabled"
      :size="size"
    >
      <ElCheckbox v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </ElCheckbox>
    </ElCheckboxGroup>

    <!-- 日期选择 -->
    <ElDatePicker
      v-else-if="controlType === 'datePicker'"
      :model-value="modelValue"
      @update:model-value="updateValue"
      type="date"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :format="dateFormat"
      :value-format="dateFormat"
      :size="size"
      style="width: 100%"
    />

    <!-- 日期时间选择 -->
    <ElDatePicker
      v-else-if="controlType === 'datetimePicker'"
      :model-value="modelValue"
      @update:model-value="updateValue"
      type="datetime"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :format="dateFormat"
      :value-format="dateFormat"
      :size="size"
      style="width: 100%"
    />

    <!-- 文件上传 -->
    <ElUpload
      v-else-if="controlType === 'upload'"
      :file-list="modelValue"
      @update:file-list="updateValue"
      :action="field.controlConfig?.uploadUrl || '/api/upload'"
      :multiple="field.controlConfig?.multiple || false"
      :limit="field.controlConfig?.limit || 1"
      :disabled="isDisabled"
      list-type="text"
    >
      <ElButton type="primary" size="small">
        {{ field.controlConfig?.multiple ? '选择文件(多选)' : '选择文件' }}
      </ElButton>
      <template #tip v-if="field.controlConfig">
        <div class="el-upload__tip">
          可上传类型: {{ field.controlConfig.accept || '*' }}
          {{
            field.controlConfig.maxSize ? `，单文件大小不超过 ${field.controlConfig.maxSize}MB` : ''
          }}
        </div>
      </template>
    </ElUpload>

    <!-- 富文本 -->
    <RichTextEditor
      v-else-if="controlType === 'richText'"
      :model-value="modelValue"
      @update:model-value="updateValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :height="250"
    />

    <!-- 默认输入框 -->
    <ElInput
      v-else
      :model-value="modelValue"
      @update:model-value="updateValue"
      :placeholder="placeholder"
      :disabled="isDisabled"
    />
  </template>
</template>

<style scoped>
.upload-readonly {
  color: #606266;
  line-height: 32px;
}

.multi-select-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mr-2 {
  margin-right: 8px;
}
</style>
