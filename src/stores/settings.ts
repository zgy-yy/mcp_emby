import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const mediaPath = ref('')

  // 动作
  const setMediaPath = (path: string) => {
    mediaPath.value = path
    // 保存到本地存储
    localStorage.setItem('mediaPath', path)
  }

  // 初始化：从本地存储加载设置
  const initSettings = () => {
    const savedMediaPath = localStorage.getItem('mediaPath')
    if (savedMediaPath) {
      mediaPath.value = savedMediaPath
    }
  }

  return {
    // 状态
    mediaPath,
    // 动作
    setMediaPath,
    initSettings
  }
}) 