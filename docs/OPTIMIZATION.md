# 项目优化说明文档

本文档记录了项目最近的优化内容，包括代码规范、TypeScript迁移、自动导入配置和全局错误处理机制。

## 1. ESLint + Prettier 代码规范

### 安装的依赖
- `eslint@8` - JavaScript代码检查工具
- `prettier@3` - 代码格式化工具
- `eslint-plugin-vue@9` - Vue.js专用ESLint插件
- `eslint-config-prettier@9` - 禁用与Prettier冲突的ESLint规则
- `eslint-plugin-prettier@5` - 将Prettier作为ESLint规则运行

### 配置文件

#### `.eslintrc.cjs`
主要规则配置：
- Vue 3 essential规则
- JavaScript基本规则
- 与Prettier集成
- 生产环境禁止console和debugger

#### `.prettierrc`
代码格式化配置：
- 不使用分号
- 使用单引号
- 2空格缩进
- 最大行宽100字符
- 不使用尾随逗号

### 使用方法

```bash
# 检查代码规范
npm run lint

# 格式化代码
npm run format
```

### VSCode配置建议

在 `.vscode/settings.json` 中添加：
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## 2. TypeScript迁移（渐进式）

### 安装的依赖
- `typescript@5` - TypeScript编译器
- `@types/node` - Node.js类型定义
- `vue-tsc` - Vue TypeScript类型检查工具

### 配置文件

#### `tsconfig.json`
- 允许JS和TS文件共存（`allowJs: true`）
- 路径别名 `@/*` 映射到 `src/*`
- 不严格检查类型（渐进式迁移）

#### `src/vite-env.d.ts`
- Vite环境变量类型定义
- Vue组件类型声明

### 已迁移的文件

1. `vite/plugins/index.ts` - Vite插件配置
2. `src/config/index.ts` - 应用配置（含类型定义）

### 渐进式迁移策略

项目采用渐进式迁移策略：
- 保留现有JS文件继续工作
- 新文件建议使用TS
- 核心配置和工具函数优先迁移
- 业务代码可逐步迁移

## 3. 自动导入配置

### 安装的依赖
- `unplugin-auto-import` - API自动导入
- `unplugin-vue-components` - 组件自动导入

### 配置内容

#### API自动导入
以下API无需手动import即可使用：
- Vue: `ref`, `computed`, `watch`, `onMounted` 等
- Vue Router: `useRouter`, `useRoute`, `onBeforeRouteLeave` 等
- Pinia: `defineStore`, `storeToRefs` 等

#### 组件自动导入
Element Plus组件无需手动注册：
```vue
<!-- 之前需要 -->
<script setup>
import { ElButton, ElCard } from 'element-plus'
</script>

<!-- 现在直接使用 -->
<template>
  <ElButton>按钮</ElButton>
  <ElCard>卡片</ElCard>
</template>
```

### 生成的类型文件

运行项目后会自动生成：
- `src/auto-imports.d.ts` - API自动导入类型声明
- `src/components.d.ts` - 组件自动导入类型声明

这些文件会被git忽略，但IDE会自动识别类型。

### ESLint配置

自动导入插件会生成 `.eslintrc-auto-import.json`，ESLint配置已启用该文件。

## 4. 全局错误处理机制

### 实现内容

创建了 `src/utils/error-handler.ts` 模块，提供：

#### Vue错误处理
- 捕获组件渲染错误
- 捕获生命周期钩子错误
- 捕获事件处理器错误

#### Promise错误处理
- 捕获未处理的Promise rejection
- 阻止控制台重复打印

#### JavaScript错误处理
- 捕获全局JavaScript错误
- 忽略资源加载错误（仅处理代码错误）

### 错误处理策略

#### 开发环境
- 详细打印错误信息（message、stack、vm、info）
- 方便调试和定位问题

#### 生产环境
- 简化错误信息打印
- 预留错误上报接口（可集成Sentry等）

#### 特定错误处理
根据错误类型进行特定提示：
- 网络错误：提示网络连接
- 401错误：提示重新登录
- 403错误：提示权限不足
- 404错误：提示资源不存在
- 500错误：提示服务器错误

### 使用方法

已在 `main.js` 中集成：
```javascript
import { setupErrorHandler } from '@/utils/error-handler'

// 在创建app后调用
setupErrorHandler(app)
```

### 扩展建议

可集成第三方监控服务：
- Sentry - 开源错误监控平台
- BugSnag - 商业错误监控服务
- 自建监控系统

在 `error-handler.ts` 的 `reportError` 方法中实现上报逻辑。

## 使用建议

### 开发流程

1. **启动开发服务器**
   ```bash
   npm run dev
   ```
   首次启动会生成 `auto-imports.d.ts` 和 `components.d.ts`

2. **开发过程中**
   - 直接使用自动导入的API和组件
   - ESLint和Prettier会在保存时自动修复
   - 全局错误处理会捕获所有错误

3. **提交代码前**
   ```bash
   # 检查代码规范
   npm run lint

   # 格式化代码
   npm run format
   ```

### 新文件编写建议

- 配置文件：使用 TypeScript
- 工具函数：使用 TypeScript
- 组件文件：可继续使用JS，逐步迁移到TS
- API文件：建议使用TS增加类型安全

### IDE配置

确保VSCode安装以下插件：
- ESLint
- Prettier
- Vue - Official (Vue Language Features)
- TypeScript Vue Plugin

## 文件变更清单

### 新增文件
- `.eslintrc.cjs` - ESLint配置
- `.prettierrc` - Prettier配置
- `.prettierignore` - Prettier忽略配置
- `.eslintignore` - ESLint忽略配置
- `tsconfig.json` - TypeScript配置
- `src/vite-env.d.ts` - Vite类型声明
- `src/utils/error-handler.ts` - 全局错误处理
- `src/auto-imports.d.ts` (自动生成)
- `src/components.d.ts` (自动生成)
- `.eslintrc-auto-import.json` (自动生成)

### 修改文件
- `package.json` - 添加依赖和lint脚本
- `vite/plugins/index.ts` - 从JS迁移到TS，添加自动导入配置
- `src/config/index.ts` - 从JS迁移到TS，添加类型定义
- `src/main.js` - 集成全局错误处理

### 删除文件
- `vite/plugins/index.js` - 已迁移到TS
- `src/config/index.js` - 已迁移到TS

## 注意事项

1. **首次运行**
   - 启动开发服务器会生成类型声明文件
   - 可能需要重启IDE以识别新类型

2. **现有代码**
   - 保留JS文件继续工作
   - 可运行 `npm run lint` 检查现有代码规范问题

3. **自动导入**
   - Element Plus组件可直接使用
   - Vue API无需手动import
   - 类型文件会被git忽略但IDE会识别

4. **错误处理**
   - 开发环境会打印详细错误
   - 生产环境可集成监控服务

## 后续优化建议

1. **TypeScript迁移**
   - 逐步迁移更多文件到TS
   - 增加更严格的类型检查
   - 为API接口添加类型定义

2. **单元测试**
   - 安装 Vitest
   - 为错误处理、权限检查等添加测试

3. **CI/CD集成**
   - 在CI流程中添加lint检查
   - 自动运行测试
   - 自动构建和部署

4. **Git Hooks**
   - 安装 Husky
   - 提交前自动lint检查
   - 自动格式化代码