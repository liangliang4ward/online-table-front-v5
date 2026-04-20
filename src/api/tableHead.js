import request from '@/api/request'

const BASE_URL = '/onlineTable/table/table-head'

export function pageQuery(params) {
  return request.post(`${BASE_URL}/pageQuery`, params)
}

export function queryById(id) {
  return request.get(`${BASE_URL}/queryById`, { params: { id } })
}

export function insert(data) {
  return request.post(`${BASE_URL}/insert`, data)
}

export function update(data) {
  return request.post(`${BASE_URL}/update`, data)
}

export function deleteById(id) {
  return request.get(`${BASE_URL}/deleteById`, { params: { id } })
}

export function batchDeleteByIds(ids) {
  return request.post(`${BASE_URL}/batchDeleteByIds`, { ids })
}

export function syncDb(tableId, syncType) {
  return request.get(`${BASE_URL}/syncDb`, { params: { tableId, syncType } })
}

export default {
  pageQuery,
  queryById,
  insert,
  update,
  deleteById,
  batchDeleteByIds,
  syncDb
}
