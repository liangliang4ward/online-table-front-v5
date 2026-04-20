<script setup>
import { ElCard, ElResult, ElButton } from 'element-plus'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'

// 如果在 qiankun 模式下，尝试返回首页
const goHome = () => {
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    window.location.href = window.location.pathname
  }
}
</script>

<template>
  <div class="qiankun-required-page">
    <ElCard>
      <ElResult
        status="warning"
        title="访问受限"
        sub-title="此应用仅支持在主应用中运行，无法独立访问"
      >
        <template #extra>
          <ElButton type="primary" @click="goHome"> 返回主应用 </ElButton>
        </template>
      </ElResult>
    </ElCard>
  </div>
</template>

<style scoped>
.qiankun-required-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}
</style>
