# 代码规范

## Vue 组件规范

### 1. 使用 `<script setup>` 语法

```vue
<script setup>
import { ref, computed } from 'vue'
import { ElButton } from 'element-plus'

const count = ref(0)
const double = computed(() => count.value * 2)

const increment = () => {
  count.value++
}
</script>
```

### 2. 组件命名

- 文件名为 PascalCase（如 `UserCard.vue`）
- 组件名与文件名一致

### 3. Prop 定义

```vue
<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
})
</script>
```

### 4. Emit 定义

```vue
<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['update', 'delete'])

const handleUpdate = () => {
  emit('update', newData)
}
</script>
```

## CSS 规范

### 1. 使用 scoped 样式

```vue
<style scoped>
.container {
  padding: 20px;
}
</style>
```

### 2. 类名命名

- 使用 kebab-case（如 `user-card`, `info-item`）

## JavaScript 规范

### 1. 导入顺序

```js
// 1. Vue 核心
import { ref, computed } from 'vue'

// 2. 第三方库
import { ElButton } from 'element-plus'

// 3. 内部模块
import { formatDate } from '@/utils'

// 4. 本地组件
import ChildComponent from './ChildComponent.vue'
```

### 2. 命名规范

- 变量/函数：camelCase
- 常量：UPPER_SNAKE_CASE
- 组件：PascalCase

## Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
test: 测试相关
chore: 构建/工具链相关
```

示例：
```bash
git commit -m "feat: add user profile page"
```

## 权限控制规范

### 1. 权限格式

权限编码采用三段式结构：`模块：资源：操作`

```
read:user:readUser      // 读取用户的读取操作
write:user:updateUser   // 写入用户的更新操作
*.*.*                   // 通配符，匹配所有权限
read:*:*                // 匹配所有 read 模块的权限
```

### 2. JavaScript 中使用

```js
import { checkPermission } from '@/utils/permission'

// 检查单个权限
if (checkPermission(['read:user:readUser'])) {
  // 有权限，执行操作
}

// 检查多个权限（OR 逻辑，满足一个即可）
if (checkPermission(['read:user:readUser', 'write:user:updateUser'])) {
  // 有任意一个权限
}

// 检查多个权限（AND 逻辑，需要全部满足）
if (checkPermission(['read:user:readUser', 'write:user:updateUser'], { logic: 'and' })) {
  // 同时拥有两个权限
}
```

### 3. 模板中使用（v-permission 指令）

```vue
<template>
  <!-- 单个权限 -->
  <ElButton v-permission="['read:user:readUser']">
    查看用户
  </ElButton>

  <!-- 多个权限（OR 逻辑） -->
  <ElButton v-permission="['read:user:readUser', 'write:user:updateUser']">
    查看或编辑用户
  </ElButton>

  <!-- 根据权限显示不同内容 -->
  <ElButton v-permission="['read:user:readUser']">查看</ElButton>
  <ElButton v-permission="['write:user:updateUser']">编辑</ElButton>
  <ElButton v-permission="['delete:user:deleteUser']" type="danger">删除</ElButton>
</template>
```

### 4. 组合式 API 中使用

```vue
<script setup>
import { checkPermission } from '@/utils/permission'

// 计算属性方式
const canReadUser = computed(() => checkPermission(['read:user:readUser']))

// 方法方式
const handleAction = () => {
  if (!checkPermission(['write:user:updateUser'])) {
    ElMessage.error('没有权限')
    return
  }
  // 执行操作
}
</script>
```
