<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { McpClient } from './index';

const mcpClient = new McpClient();
const query = ref('');
const isConnected = ref(false);
const error = ref('');
const result = ref('');
onMounted(async () => {
    try {
        await mcpClient.connectToServer('/mcp');
        isConnected.value = true;
    } catch (e) {
        error.value = e instanceof Error ? e.message : '连接失败';
        console.error('连接失败:', e);
    }
});

const processMessage = async () => {
    if (!isConnected.value) {
        error.value = '未连接到服务器';
        return;
    }
    try {
       const res = await mcpClient.processMessage(query.value);
       result.value = res.join('\n');
    } catch (e) {
        error.value = e instanceof Error ? e.message : '处理消息失败';
        console.error('处理消息失败:', e);
    }
}
</script>

<template>
    <div class="main">
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="isConnected" class="status">已连接到服务器</div>
        <div>{{result}}</div>
        <input type="text" v-model="query" />
        <button @click="processMessage" :disabled="!isConnected">处理</button>
    </div>
</template>

<style scoped>
.error {
    color: red;
    margin-bottom: 10px;
}
.status {
    color: green;
    margin-bottom: 10px;
}
</style>
