<script setup>
import { ref, computed } from 'vue'
import {
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElMessage,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag
} from 'element-plus'
import { useUserStore } from '@/store/user'
import { fetchUserInfo } from '@/api/common'

const userStore = useUserStore()

// 表单数据
const tokenForm = ref({
  token: '',
  appCode: 'tenantOperate'
})

// 加载状态
const loading = ref(false)

// 获取到的用户信息
const userInfo = ref(null)

// 格式化 JSON
const formatJson = obj => {
  if (!obj) return '-'
  return JSON.stringify(obj, null, 2)
}

/**
 * 获取当前用户信息
 */
const handleGetUserInfo = async () => {
  if (!tokenForm.value.token) {
    ElMessage.error('请输入 token')
    return
  }

  loading.value = true
  try {
    // 临时设置 token
    userStore.setToken(tokenForm.value.token)

    // 调用接口
    const data = await fetchUserInfo({ appCode: tokenForm.value.appCode })
    userInfo.value = data
    ElMessage.success('获取用户信息成功')
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    loading.value = false
    // 恢复原始 token
    if (tokenForm.value.token) {
      userStore.setToken(tokenForm.value.token)
    }
  }
}

/**
 * 保存用户信息到 store
 */
const saveUserInfo = () => {
  if (!userInfo.value) {
    ElMessage.error('没有可保存的用户信息')
    return
  }

  // 提取需要的信息
  const loginInfo = {
    displayName: userInfo.value.displayName,
    appCode: userInfo.value.appCode,
    permissionCodes: userInfo.value.permissionCodes || [],
    roleCodes: (userInfo.value.roles || []).map(r => r.roleCode),
    userId: userInfo.value.userId,
    username: userInfo.value.username
  }

  // 存储到 userStore
  userStore.setLoginInfo(loginInfo)
  userStore.setToken(tokenForm.value.token)

  ElMessage.success('用户信息已保存，可用于本地调试')
}
</script>

<template>
  <div class="page-container">
    <ElCard class="box-card">
      <template #header>
        <div class="card-header">
          <h2>Token 调试工具</h2>
        </div>
      </template>
      <ElForm :model="tokenForm" label-width="100px">
        <ElFormItem label="Token">
          <ElInput
            v-model="tokenForm.token"
            type="textarea"
            :rows="4"
            placeholder="请输入访问 token"
          />
        </ElFormItem>
        <ElFormItem label="AppCode">
          <ElInput v-model="tokenForm.appCode" placeholder="请输入应用编码" />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" :loading="loading" @click="handleGetUserInfo">
            获取当前用户
          </ElButton>
          <ElButton type="success" :disabled="!userInfo" @click="saveUserInfo">
            保存用户信息
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard v-if="userInfo" class="box-card user-info">
      <template #header>
        <div class="card-header">
          <h2>用户信息</h2>
          <ElTag type="success">已获取</ElTag>
        </div>
      </template>
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="用户名">{{ userInfo.username || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="显示名称">{{ userInfo.displayName || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="用户 ID">{{ userInfo.userId || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="应用编码">{{ userInfo.appCode || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="租户 ID">{{ userInfo.tenantId || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="需修改密码">
          <ElTag :type="userInfo.needModifyPwd ? 'warning' : 'success'">
            {{ userInfo.needModifyPwd ? '是' : '否' }}
          </ElTag>
        </ElDescriptionsItem>
      </ElDescriptions>

      <div class="json-block" v-if="userInfo.permissionCodes?.length">
        <h4>权限列表</h4>
        <ElTag
          v-for="(code, index) in userInfo.permissionCodes"
          :key="index"
          style="margin-right: 8px; margin-bottom: 8px"
        >
          {{ code }}
        </ElTag>
      </div>

      <div class="json-block">
        <h4>原始数据</h4>
        <pre>{{ formatJson(userInfo) }}</pre>
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
  width: 60%;
  max-width: 800px;
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

.user-info {
  background-color: #f5faff;
}

.json-block {
  margin-top: 20px;
}

.json-block h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.json-block pre {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
}
</style>
