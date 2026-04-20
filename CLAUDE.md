# CLAUDE.md

此文件为 AI 助手提供项目上下文和指导。

## 项目概览

这是一个 Vue 3 + Vite + Element Plus 前端项目模板。

## 开发指南

### 技术栈
- Vue 3.x (Composition API / `<script setup>`)
- Vite
- Element Plus
- Vue Router 4.x
- Pinia
- Axios
- qiankun (微前端)

### 代码风格
- 使用 `<script setup>` 语法
- 使用组合式 API
- 路径别名：`@` 指向 `src/`

### 目录规范
- `src/views/` - 页面级组件
- `src/components/` - 通用组件
- `src/api/` - API 接口层
- `src/store/` - Pinia 状态管理
  - `src/store/user.js` - 用户状态管理（token、loginInfo）
- `src/utils/` - 工具函数
- `src/hooks/` - 组合式函数
- `src/config/` - 应用配置
- `src/directives/` - 自定义指令

### qiankun 子应用

- 支持独立运行和子应用两种模式
- 通过 `qiankunWindow.__POWERED_BY_QIANKUN__` 判断运行环境
- 主应用传递：`publicPath`、`token`、`loginInfo` 等
- 使用 `vite-plugin-qiankun` 插件简化接入

### 配置
- 环境变量：`.env*` 文件
- 应用配置：`src/config/index.js`
- 路由：`src/router/index.js`
