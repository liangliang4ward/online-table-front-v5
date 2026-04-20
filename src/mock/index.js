// 生成唯一ID
export const generateId = () => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// 获取当前时间字符串
export const getCurrentTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 成功响应包装
export const successResponse = (data) => {
  return {
    success: true,
    data: data,
    msg: '操作成功'
  }
}

// 分页响应包装
export const pageResponse = (list, total, pageNo, pageSize) => {
  return successResponse({
    list: list,
    total: total,
    pageNo: pageNo,
    pageSize: pageSize,
    pages: Math.ceil(total / pageSize)
  })
}

// 对数组进行分页处理
export const paginate = (array, pageNo, pageSize) => {
  const start = (pageNo - 1) * pageSize
  const end = start + pageSize
  return {
    list: array.slice(start, end),
    total: array.length
  }
}
