<script setup lang="ts">
import { ref ,toRaw} from 'vue'
import { McpClient } from '@/mcp-client/index.ts'
import { useSettingsStore } from '@/stores/settings.ts'
import type { FileInfo } from '@/types/fileInfo.ts'
import FileTree from '@/components/FileTree.vue'
import type { AIMessage, FileSortingItem } from '@/types/mcp.ts'

const settingsStore = useSettingsStore()
const mcpClient = new McpClient()
const isConnected = ref(false)//mcp 连接状态
const isProcessing = ref(false)//处理状态
const error = ref('')
const result = ref('')
const selectedPath = ref<string>('')//当前选中的目录
const showConfirm = ref(false)
const renameList = ref<Array<FileSortingItem>>([])
const isConfirmed = ref(false)

const mediaFiles = ref<FileInfo[]>([])

function getFileSgructure() {
    mcpClient.getFileStructure(settingsStore.mediaPath).then((res) => {
        const content = (res).content[0]
        console.log('res', res)
        const fileInfo: FileInfo[] = JSON.parse(content.text || '')
        mediaFiles.value = fileInfo
        console.log('目录文件结构', fileInfo)
    }).catch((e) => {
      error.value = e instanceof Error ? e.message : '获取目录文件结构失败'
    })
}

mcpClient.connectToServer('/mcp').then(() => {
    isConnected.value = true
    console.log('连接成功')
    getFileSgructure()
  }).catch((e) => {
    error.value = e instanceof Error ? e.message : '连接失败'
  })

const processMessage = async () => {
  if (!mcpClient) {
    error.value = '未连接到服务器'
    return
  }

  try {
    isProcessing.value = true
    error.value = ''
    result.value = ''

    // 获取选中目录的结构
    const path = selectedPath.value
    if (!path) {
      error.value = '请先选择一个目录'
      return
    }

    const structure = await mcpClient.getFileStructure(path)
    const fileInfo = JSON.parse(structure.content[0].text || '[]')
    
    // 构建提示信息
    const prompt = `请分析以下目录结构并处理：\n${JSON.stringify(fileInfo, null, 2)}`
    // 发送给 AI 处理
    const response = await mcpClient.processMessage(prompt, (res: AIMessage) => {
    })

    if (response?.type === 'files_sorting') {
        console.log('response files_sorting',response)
      const fileSortingList = response.data 
      renameList.value = fileSortingList
      showConfirm.value = true
    }
    if (response?.type === 'prompt' || response?.type === 'confirm' || response?.type === 'error' || response?.type === 'success') {
        result.value = response.data
      }
    if (response?.type === 'error') {
      error.value = response.data
    }
  } catch (err: any) {
    console.error('处理失败:', err)
    error.value = err.message || '处理失败'
  } finally {
    isProcessing.value = false
  }
}

const confirmRename = async () => {
  try {
    isProcessing.value = true
    error.value = ''
    isConfirmed.value = true
    result.value = ''
    
    // 发送确认消息给 AI
    const response = await mcpClient.processMessage('确认重命名', (res: any) => {
      if (res.type === 'success') {
      } else if (res.type === 'error') {
        error.value = res.data
      }
    })

    if (response?.type === 'success') {
        result.value = response.data
    }else if(response?.type === 'error'){
        result.value = response.data
    }


  } catch (err: any) {
    console.error('确认失败:', err)
    error.value = err.message || '确认失败'
    isConfirmed.value = false
  } finally {
    isProcessing.value = false
    isConfirmed.value = false
  }
}

const cancelRename = () => {
  showConfirm.value = false
  renameList.value = []
  result.value = ''
}

const handleFileSelect = (file: FileInfo) => {
    console.log('file',toRaw(file))
    selectedPath.value = file.path
}


</script>


<template>
  <div class="file-manager">
    <div class="header">
      <router-link to="/" class="back-button">返回</router-link>
      <h1>文件管理</h1>
    </div>

    <div :class="`message ${isConnected?'success':'error'}`">
     {{ isConnected ? 'mcp 连接成功' : 'mcp 连接失败' }}
    </div>
    <div v-if="error" class="message error">
      {{ error }}
    </div>

    <div class="content">
      <div v-if="!isProcessing" class="step">
        <div class="selected-path" v-if="selectedPath">
          已选择：{{ selectedPath }}
        </div>
        <div class="actions">
          <button
            class="primary"
            :disabled="!selectedPath || isProcessing || isConfirmed"
            @click="processMessage"
          >
            开始处理
          </button>
        </div>
      </div>

      <div v-if="isProcessing" class="step">
        <div class="processing-message">
          正在处理中...
        </div>
      </div>

      <!-- 重命名确认对话框 -->
      <div v-if="showConfirm" class="confirm-dialog">
        <h3>确认重命名</h3>
        <div class="rename-list">
          <div v-for="(item, index) in renameList" :key="index" class="rename-item">
            <div class="path-group">
              <div class="label">原文件名：</div>
              <div class="path">{{ item.ori_name }}</div>
            </div>
            <div class="path-group">
              <div class="label">新文件名：</div>
              <div class="path">{{ item.new_name }}</div>
            </div>
          </div>
        </div>
        <div class="confirm-actions">
          <button 
            class="primary" 
            @click="confirmRename"
            :disabled="isProcessing || isConfirmed"
          >
            {{ isConfirmed ? '处理中...' : '确认' }}
          </button>
          <button 
            class="secondary" 
            @click="cancelRename"
            :disabled="isProcessing || isConfirmed"
          >
            取消
          </button>
        </div>
      </div>

      <div v-if="result" class="message success">{{result}}</div>
      

      <div v-if="mediaFiles.length > 0" class="file-tree-container">
        <h2>文件结构</h2>
        <file-tree
          :files="mediaFiles"
          :selected-path="selectedPath"
          @select="handleFileSelect"
        />
      </div>
    </div>
  </div>
</template>


<style scoped>
.file-manager {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: calc(var(--spacing-unit) * 2);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: calc(var(--spacing-unit) *1);
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
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 2);
}

.step {
  background: #fff;
  border-radius: 8px;
  padding: calc(var(--spacing-unit) * 2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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

button.primary {
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

button.primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button.primary:hover:not(:disabled) {
  background: #3aa876;
}

.message {
  padding: var(--spacing-unit);
  border-radius: 4px;
  margin-bottom: var(--spacing-unit);
  text-align: center;
}

.error {
  background: #fee;
  color: #c00;
}

.success {
  background: #efe;
  color: #0c0;
}

.processing-message {
  text-align: center;
  color: #666;
  font-size: 1.1rem;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
}

.result-item {
  background: #fff;
  border-radius: 8px;
  padding: var(--spacing-unit);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.path-group {
  display: flex;
  gap: var(--spacing-unit);
  margin-bottom: calc(var(--spacing-unit) / 2);
  align-items: flex-start;
}

.label {
  color: #666;
  min-width: 80px;
  flex-shrink: 0;
}

.path {
  color: #2c3e50;
  word-break: break-all;
  text-align: left;
  flex: 1;
}

.confirm-actions {
  display: flex;
  gap: var(--spacing-unit);
  justify-content: flex-end;
  flex-wrap: wrap;
}

button.primary,
button.secondary {
  min-width: 100px;
  white-space: nowrap;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
  }

  button.primary,
  button.secondary {
    width: auto;
    min-width: 100px;
  }

  .confirm-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .step {
    padding: var(--spacing-unit);
  }

  h1 {
    font-size: 1.25rem;
  }

  .path-group {
    flex-direction: column;
    gap: calc(var(--spacing-unit) / 2);
  }

  .label {
    min-width: auto;
  }

  .confirm-actions {

    flex-wrap: nowrap;
  }

  button.primary,
  button.secondary {
    width: 100%;
  }
}

.file-tree-container {
  background: #fff;
  border-radius: 8px;
  padding: calc(var(--spacing-unit) * 2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.file-tree-container h2 {
  margin: 0 0 var(--spacing-unit);
  color: #2c3e50;
  font-size: 1.25rem;
}

.selected-path {
  margin-bottom: var(--spacing-unit);
  padding: var(--spacing-unit);
  background: #f5f5f5;
  border-radius: 4px;
  color: #2c3e50;
}

.confirm-dialog {
  background: #fff;
  border-radius: 8px;
  padding: calc(var(--spacing-unit) * 2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.confirm-dialog h3 {
  margin: 0 0 var(--spacing-unit);
  color: #2c3e50;
  font-size: 1.25rem;
}

.rename-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: var(--spacing-unit);
}

.rename-item {
  padding: var(--spacing-unit);
  border-bottom: 1px solid #eee;
}

.rename-item:last-child {
  border-bottom: none;
}

button.secondary {
  background: #f5f5f5;
  color: #2c3e50;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

button.secondary:hover {
  background: #e5e5e5;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

button.secondary:disabled {
  background: #f5f5f5;
  color: #999;
  border-color: #ddd;
}
</style> 