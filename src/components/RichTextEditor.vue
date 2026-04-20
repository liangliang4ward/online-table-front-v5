<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  height: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue'])

// 编辑器实例
const editorRef = ref(null)
const toolbarRef = ref(null)

// 编辑器配置
const editorConfig = computed(() => ({
  placeholder: props.placeholder,
  readOnly: props.disabled,
  MENU_CONF: {
    uploadImage: {
      // 图片上传配置，可根据实际需求修改
      server: '/api/upload/image',
      fieldName: 'file',
      maxFileSize: 10 * 1024 * 1024,
      allowedFileTypes: ['image/*'],
      // 自定义上传
      customUpload: (file, insertFn) => {
        console.log('上传图片:', file)
        // 这里可以实现自定义上传逻辑
        // 示例：使用 URL.createObjectURL 预览（实际项目中应该上传到服务器）
        const url = URL.createObjectURL(file)
        insertFn(url, file.name, url)
      }
    }
  }
}))

// 工具栏配置
const toolbarConfig = {
  // 排除哪些菜单
  excludeKeys: ['fullScreen', 'codeBlock', 'todo']
}

// 编辑器模式
const mode = ref('default')

// 编辑器默认内容（初始值）
const defaultContent = ref('')

// 标记是否是用户手动输入导致的变化，避免循环更新
let isManualChange = false

// 同步值到编辑器
const syncValueToEditor = value => {
  if (!editorRef.value || isManualChange) return

  const editor = editorRef.value
  const currentHtml = editor.getHtml()

  // 处理 undefined/null 的情况
  const normalizedValue = value ?? ''

  // 只有当值真正不同时才更新，避免循环
  if (currentHtml !== normalizedValue) {
    editor.setHtml(normalizedValue)
  }
}

// 监听 modelValue 变化（包括初始值）
watch(
  () => props.modelValue,
  newVal => {
    syncValueToEditor(newVal)
  },
  { immediate: true }
)

// 监听 disabled 变化
watch(
  () => props.disabled,
  newVal => {
    if (editorRef.value) {
      const editor = editorRef.value
      if (newVal) {
        editor.disable()
      } else {
        editor.enable()
      }
    }
  }
)

// 编辑器创建时
const handleCreated = editor => {
  editorRef.value = editor
  // 设置初始内容
  syncValueToEditor(props.modelValue)
}

// 编辑器内容变化时
const handleChange = editor => {
  isManualChange = true
  const html = editor.getHtml()
  emit('update:modelValue', html)
  // 重置标记
  setTimeout(() => {
    isManualChange = false
  }, 0)
}

// 组件销毁时销毁编辑器
onBeforeUnmount(() => {
  if (editorRef.value) {
    editorRef.value.destroy()
    editorRef.value = null
  }
})
</script>

<template>
  <div class="rich-text-editor">
    <div class="rich-text-toolbar">
      <Toolbar ref="toolbarRef" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    </div>
    <div class="rich-text-content" :style="{ height: `${height}px` }">
      <Editor
        :defaultConfig="editorConfig"
        :defaultContent="defaultContent"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="handleChange"
      />
    </div>
  </div>
</template>

<style scoped>
.rich-text-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.rich-text-toolbar {
  border-bottom: 1px solid #dcdfe6;
  background: #fafafa;
}

.rich-text-content {
  min-height: 150px;
  overflow-y: auto;
}

.rich-text-content :deep(.w-e-text-container) {
  height: 100% !important;
}

.rich-text-content :deep(.w-e-editor-loading) {
  height: 100%;
}
</style>
