/**
 * store/index.js
 * Pinia 状态管理入口
 */
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    title: 'subApp-template'
  }),
  getters: {
    getTitle: state => state.title
  },
  actions: {
    setTitle(title) {
      this.title = title
    }
  }
})
