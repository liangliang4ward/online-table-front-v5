import { generateId, getCurrentTime, successResponse, pageResponse, paginate } from './index'

// 默认数据源数据
const DEFAULT_DATASOURCES = [
  {
    id: 'ds_001',
    datasourceName: '主数据库',
    dbType: 'mysql',
    dbUrl: 'jdbc:mysql://localhost:3306/online_table',
    dbUsername: 'root',
    dbPassword: '123456',
    dbExtInfo: '{}',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00'
  },
  {
    id: 'ds_002',
    datasourceName: '测试数据库',
    dbType: 'mysql',
    dbUrl: 'jdbc:mysql://192.168.1.100:3306/test_db',
    dbUsername: 'test_user',
    dbPassword: 'test_pass',
    dbExtInfo: '{"characterEncoding": "UTF-8", "useSSL": false}',
    createTime: '2024-01-16 14:20:00',
    updateTime: '2024-01-16 14:20:00'
  },
  {
    id: 'ds_003',
    datasourceName: '业务数据库',
    dbType: 'mysql',
    dbUrl: 'jdbc:mysql://10.0.0.5:3306/business_db',
    dbUsername: 'business',
    dbPassword: 'business_pass',
    dbExtInfo: '{}',
    createTime: '2024-01-17 09:15:00',
    updateTime: '2024-01-17 09:15:00'
  }
]

// 数据源存储（使用 localStorage 持久化）
const STORAGE_KEY = 'mock_datasources'

const loadDatasources = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  // 首次加载，初始化默认数据
  saveDatasources(DEFAULT_DATASOURCES)
  return [...DEFAULT_DATASOURCES]
}

const saveDatasources = (datasources) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datasources))
}

// 分页查询
export function pageQuery(params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const datasources = loadDatasources()
      let filtered = datasources

      // 按名称模糊查询
      if (params.datasourceName) {
        filtered = filtered.filter((ds) =>
          ds.datasourceName.toLowerCase().includes(params.datasourceName.toLowerCase())
        )
      }

      // 按数据库类型查询
      if (params.dbType) {
        filtered = filtered.filter((ds) => ds.dbType === params.dbType)
      }

      // 分页
      const pageNo = params.pageNo || 1
      const pageSize = params.pageSize || 10
      const { list, total } = paginate(filtered, pageNo, pageSize)

      resolve(pageResponse(list, total, pageNo, pageSize))
    }, 200)
  })
}

// 根据ID查询
export function queryById(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const datasources = loadDatasources()
      const datasource = datasources.find((ds) => ds.id === id)
      resolve(successResponse(datasource || null))
    }, 100)
  })
}

// 新增
export function insert(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const datasources = loadDatasources()
      const newDatasource = {
        ...data,
        id: generateId(),
        createTime: getCurrentTime(),
        updateTime: getCurrentTime()
      }
      datasources.push(newDatasource)
      saveDatasources(datasources)
      resolve(successResponse(true))
    }, 200)
  })
}

// 更新
export function update(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const datasources = loadDatasources()
      const index = datasources.findIndex((ds) => ds.id === data.id)
      if (index !== -1) {
        datasources[index] = {
          ...datasources[index],
          ...data,
          updateTime: getCurrentTime()
        }
        saveDatasources(datasources)
      }
      resolve(successResponse(true))
    }, 200)
  })
}

// 根据ID删除
export function deleteById(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const datasources = loadDatasources()
      const filtered = datasources.filter((ds) => ds.id !== id)
      saveDatasources(filtered)
      resolve(successResponse(true))
    }, 150)
  })
}

// 批量删除
export function batchDeleteByIds(ids) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const datasources = loadDatasources()
      const filtered = datasources.filter((ds) => !ids.includes(ds.id))
      saveDatasources(filtered)
      resolve(successResponse(true))
    }, 150)
  })
}

// 获取所有数据源（供其他模块使用）
export function getAllDatasources() {
  return loadDatasources()
}

export default {
  pageQuery,
  queryById,
  insert,
  update,
  deleteById,
  batchDeleteByIds,
  getAllDatasources
}
