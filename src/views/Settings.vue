<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()
const mediaPath = ref(settingsStore.mediaPath)

// 监听 store 变化
const updateFromStore = () => {
  mediaPath.value = settingsStore.mediaPath
}

onMounted(() => {
  updateFromStore()
})

const saveMediaPath = () => {
  settingsStore.setMediaPath(mediaPath.value)
}
</script>


<template>
  <div class="settings">
    <div class="header">
      <router-link to="/" class="back-button">返回</router-link>
      <h1>设置</h1>
    </div>

    <div class="content">
      <div class="setting-group">
        <h2>文件设置</h2>
        <div class="setting-item">
          <label for="mediaPath">默认媒体目录</label>
          <div class="input-group">
            <input
              id="mediaPath"
              v-model="mediaPath"
              type="text"
              placeholder="/path/to/media"
            />
            <button @click="saveMediaPath">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
.settings {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--spacing-unit);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: calc(var(--spacing-unit) * 2);
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  color: #42b983;
  text-decoration: none;
  font-size: 1rem;
}

h1 {
  width: 100%;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  font-size: 1.75rem;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 2);
}

.setting-group {
  background: #fff;
  border-radius: 8px;
  padding: calc(var(--spacing-unit) * 2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin: 0 0 var(--spacing-unit);
  font-size: 1.25rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) / 2);
}

label {
  color: #666;
  font-size: 0.9rem;
}

.input-group {
  display: flex;
  gap: var(--spacing-unit);
}

input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

button:hover {
  background: #3aa876;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
  }

  button {
    width: 100%;
  }

  h1 {
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .header {
    margin-bottom: var(--spacing-unit);
  }

  .setting-group {
    padding: var(--spacing-unit);
  }

  h1 {
    font-size: 1.25rem;
  }

  h2 {
    font-size: 1rem;
  }

  label {
    font-size: 0.85rem;
  }
}
</style> 