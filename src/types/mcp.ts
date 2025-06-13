// 基础消息类型
export type MessageType = 'prompt' | 'confirm' | 'error' | 'success' | 'files_sorting' | 'call_tools'

// 文件排序数据结构
export interface FileSortingItem {
  ori_name: string
  new_name: string
}

// 文件排序消息
export interface FileSortingMessage {
  type: 'files_sorting'
  data: FileSortingItem[]
}

// 工具调用消息
export interface CallToolsMessage {
  type: 'call_tools'
  data: {
    action: string
  }
}

// 基础消息
export interface BaseMessage {
  type: 'prompt' | 'confirm' | 'error' | 'success'
  data: string
}

// 所有可能的消息类型
export type AIMessage = FileSortingMessage | CallToolsMessage | BaseMessage

// 工具内容类型
export interface ToolContent {
  type: 'text' | 'image' | 'audio' | 'file' | 'error'
  text?: string
  data?: string
  mimeType?: string
  error?: string
}

// 工具结果类型
export interface ToolResult {
  content: ToolContent[]
}

// 工具调用参数类型
export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

// 工具调用结果类型
export interface ToolCallResult {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
  result: ToolResult
} 