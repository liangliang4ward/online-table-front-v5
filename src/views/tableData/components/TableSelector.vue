<script setup>
defineProps({
  tableHeads: {
    type: Array,
    required: true
  },
  selectedTableId: {
    required: true
  }
})

const emit = defineEmits(['update:selectedTableId'])

const updateSelectedTableId = value => {
  emit('update:selectedTableId', value)
}
</script>

<template>
  <ElCard class="table-select-card">
    <div class="table-select-bar">
      <div class="select-item">
        <span class="select-label">选择数据表</span>
        <ElSelect
          :model-value="selectedTableId"
          @update:model-value="updateSelectedTableId"
          placeholder="请选择要管理的数据表"
          style="width: 300px"
          filterable
        >
          <ElOption
            v-for="table in tableHeads"
            :key="table.id"
            :label="`${table.tableName} - ${table.tableTxt}`"
            :value="table.id"
          />
        </ElSelect>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.table-select-card {
  margin-bottom: 16px;
}

.table-select-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.select-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-label {
  color: #606266;
  white-space: nowrap;
}
</style>
