<script setup lang="ts">
import { onMounted } from 'vue';
import { useSettingsStore } from './stores/settings'

const settingsStore = useSettingsStore()

onMounted(() => {
  // 初始化设置
  settingsStore.initSettings()
});


</script>

<template>
  <router-view></router-view>
</template>

<style>
:root {
  --max-width: 1200px;
  --header-height: 60px;
  --spacing-unit: 1rem;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  font-size: 16px;
  line-height: 1.5;
}

#app {
  min-height: 100vh;
}

/* 响应式断点 */
@media (max-width: 768px) {
  :root {
    --spacing-unit: 0.75rem;
  }
  
  body {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  :root {
    --spacing-unit: 0.5rem;
  }
  
  body {
    font-size: 12px;
  }
}
</style>
