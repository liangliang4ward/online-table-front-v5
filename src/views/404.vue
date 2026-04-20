<script setup>
import { ElButton, ElResult, ElSpace } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/index')
}

const goBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="page-404">
    <ElResult icon="error" title="404" sub-title="抱歉，您访问的页面不存在或已被移除">
      <template #extra>
        <ElSpace>
          <ElButton @click="goBack"> 返回上一页 </ElButton>
          <ElButton type="primary" @click="goHome"> 返回首页 </ElButton>
        </ElSpace>
      </template>
      <template #icon>
        <div class="result-icon">404</div>
      </template>
    </ElResult>
  </div>
</template>

<style scoped>
.page-404 {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.result-icon {
  font-size: 100px;
  font-weight: bold;
  color: #409eff;
}
</style>
