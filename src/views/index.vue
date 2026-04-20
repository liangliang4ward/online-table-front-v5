<script setup>
import { computed, ref } from 'vue'
import {
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
  ElTable,
  ElTableColumn,
  ElButton,
  ElMessage
} from 'element-plus'
import { useUserStore } from '@/store/user'
import { fetchUserInfo } from '@/api/common'
import { checkPermission } from '@/utils/permission'

const projectInfo = {
  name: 'subApp-template',
  vueVersion: '3.x',
  uiFramework: 'Element Plus',
  buildTool: 'Vite',
  packageManager: 'npm'
}

// 获取用户状态
const userStore = useUserStore()

// 加载状态
const loading = ref(false)

// 获取到的用户详细信息
const userInfo = ref(null)

// 计算属性
const token = computed(() => userStore.getToken())
const loginInfo = computed(() => userStore.getLoginInfo())

// 权限表格数据（响应式）
const permissionTableData = computed(() => {
  const info = loginInfo.value
  return [
    { label: 'displayName', value: info?.displayName || '-' },
    { label: 'appCode', value: info?.appCode || '-' },
    { label: 'permissionCodes', value: info?.permissionCodes?.join(', ') || '-' }
  ]
})

/**
 * 获取当前用户信息
 */
const handleFetchUserInfo = async () => {
  loading.value = true
  try {
    const data = await fetchUserInfo()
    userInfo.value = data
    ElMessage.success('获取用户信息成功')
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 检查权限
 */
const handleCheckPermission = () => {
  const hasPermission = checkPermission(['read:user:readUser'])
  ElMessage.info(`权限检查结果：${hasPermission ? '有权限' : '无权限'}`)
}
</script>

<template>
  <div class="page-container">
    <ElCard class="box-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <h2>快速导航</h2>
          <ElButton type="danger" size="small" @click="$router.push('/debug-token')">
            🔑 调试Token
          </ElButton>
        </div>
      </template>
      <div style="display: flex; gap: 10px">
        <ElButton type="primary" @click="$router.push('/datasource')">数据源管理</ElButton>
        <ElButton type="primary" @click="$router.push('/tableHead')">数据表管理</ElButton>
        <ElButton type="success" @click="$router.push('/tableData')">表数据管理</ElButton>
      </div>
    </ElCard>

    <ElCard class="box-card user-info">
      <template #header>
        <div class="card-header">
          <h2>用户信息</h2>
          <div>
            <ElButton type="primary" size="small" :loading="loading" @click="handleFetchUserInfo">
              获取用户信息
            </ElButton>
            <ElButton type="info" size="small" @click="handleCheckPermission"> 检查权限 </ElButton>
            <ElTag type="primary" v-if="token">已登录</ElTag>
            <ElTag v-else>未登录</ElTag>
          </div>
        </div>
      </template>
      <ElDescriptions :column="1" border>
        <ElDescriptionsItem label="token">
          <span v-if="token">{{ token }}</span>
          <span v-else>-</span>
        </ElDescriptionsItem>
      </ElDescriptions>

      <ElTable :data="permissionTableData" style="margin-top: 20px" border size="small">
        <ElTableColumn prop="label" label="字段" width="150" />
        <ElTableColumn prop="value" label="值" />
      </ElTable>

      <ElDescriptions v-if="userInfo" :column="2" border style="margin-top: 20px">
        <ElDescriptionsItem label="用户名">{{ userInfo.username || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="显示名称">{{ userInfo.displayName || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="用户 ID">{{ userInfo.userId || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="应用编码">{{ userInfo.appCode || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="租户 ID">{{ userInfo.tenantId || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="登录时间">{{ userInfo.loginTime || '-' }}</ElDescriptionsItem>
      </ElDescriptions>

      <div style="margin-top: 20px">
        <h4 style="margin-bottom: 10px">权限指令示例</h4>
        <ElButton v-permission="['read:user:readUser']" size="small" type="success">
          有 read:user:readUser 权限可见
        </ElButton>
        <ElButton v-permission="['*.*.*']" size="small" type="warning">
          有 *.*.* 权限可见
        </ElButton>
        <ElButton v-permission="['admin:admin:admin']" size="small" type="danger">
          有 admin:admin:admin 权限可见
        </ElButton>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
}

.box-card {
  min-width: 400px;
  width: 50%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
}

.card-header > div {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  background-color: #f5faff;
}
</style>
