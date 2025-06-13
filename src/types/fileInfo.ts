export interface FileInfo {
    name: string
    path: string
    isDirectory: boolean
    size: number
    modifiedTime: Date
    children?: FileInfo[]
}