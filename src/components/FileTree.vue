<script setup lang="ts">
import { ref } from 'vue'
import type { FileInfo } from '@/types/fileInfo'

const props = defineProps<{
  files: FileInfo[]
  selectedPath: string
}>()

const emit = defineEmits<{
  (e: 'select', fileInfo:FileInfo): void
}>()

const expandedPaths = ref<Set<string>>(new Set())

const toggleExpand = (path: string) => {
  if (expandedPaths.value.has(path)) {
    expandedPaths.value.delete(path)
  } else {
    expandedPaths.value.add(path)
  }
}

const handleSelect = ( fileInfo: FileInfo) => {
  emit('select', fileInfo)
}

const isExpanded = (path: string) => {
  return expandedPaths.value.has(path)
}
</script>

<template>
  <div class="file-tree">
    <div v-for="file in files" :key="file.path" class="tree-item">
      <div class="file-info" :class="{ 'selected': selectedPath === file.path }">
        <div class="file-header" @click="handleSelect(file)">
          <span v-if="file.isDirectory" class="expand-icon" @click.stop="toggleExpand(file.path)">
            {{ isExpanded(file.path) ? '▼' : '▶' }}
          </span>
          <span class="file-name">{{ file.name }}</span>
        </div>
      </div>
      <div v-if="file.isDirectory && isExpanded(file.path) && file.children" class="children">
        <file-tree
          :files="file.children"
          :selected-path="selectedPath"
          @select="handleSelect"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-tree {
  width: 100%;
}

.tree-item {
  margin-left: calc(var(--spacing-unit) * 1.5);
}

.file-info {
  cursor: pointer;
  transition: background-color 0.2s;
}

.file-info:hover {
  background-color: #f5f5f5;
}

.file-info.selected {
  background-color: #e3f2fd;
}

.file-header {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) / 2);
  padding: calc(var(--spacing-unit) / 3) 0;
}

.expand-icon {
  width: 16px;
  text-align: center;
  color: #666;
  font-size: 0.7rem;
}

.file-name {
  color: #2c3e50;
  font-size: 0.9rem;
}

.children {
  margin-left: calc(var(--spacing-unit) * 1.5);
}
</style> 