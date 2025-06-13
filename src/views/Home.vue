
<script setup lang="ts">
// 组件逻辑
</script>

<template>
  <div class="home">
    <h1>Emby 文件管理器</h1>
    <div class="menu">
      <router-link to="/file-manager" class="menu-item">
        <h2>文件管理</h2>
        <p>管理您的媒体文件，按照 Emby 规范整理</p>
      </router-link>
      <router-link to="/settings" class="menu-item">
        <h2>设置</h2>
        <p>配置应用程序设置</p>
      </router-link>
    </div>
  </div>
</template>


<style scoped>
.home {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.menu {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.menu-item {
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.menu-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.menu-item h2 {
  color: #42b983;
  margin-bottom: 1rem;
}

.menu-item p {
  color: #666;
  margin: 0;
}
</style>
