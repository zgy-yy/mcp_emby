import { date, z } from "zod";
import fs from "fs/promises";
import path from "path";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import { ServerRequest, ServerNotification } from "@modelcontextprotocol/sdk/types.js";

// 基础 schema
const pathSchema = z.string().describe("文件或目录路径");

// 移动/重命名 schema
const moveSchema = z.object({
    source: pathSchema,
    destination: pathSchema
});

// 删除 schema
const deleteSchema = z.object({
    path: pathSchema
});

// 读取文件结构 schema
const structureSchema = z.object({
    path: pathSchema,
    depth: z.number().optional().describe("递归深度，不指定则递归到最深")
});

// 移动/重命名文件或目录
export const moveFileSchema = moveSchema.shape;
export const moveFileHandler = async (
    args: z.infer<typeof moveSchema>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
) => {
    try {
        // 检查源路径是否存在
        const sourceStats = await fs.stat(args.source);
        const isDirectory = sourceStats.isDirectory();

        // 检查目标路径是否已存在
        try {
            const targetStats = await fs.stat(args.destination);
            throw new Error(`目标路径已存在: ${args.destination}`);
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }

        // 确保目标路径的父目录存在
        const targetDir = path.dirname(args.destination);
        await fs.mkdir(targetDir, { recursive: true });

        // 执行重命名操作
        await fs.rename(args.source, args.destination);

        // 检查并删除空的原目录
        const sourceDir = path.dirname(args.source);
        let sourceDirDeleted = false;
        try {
            const remainingFiles = await fs.readdir(sourceDir);
            if (remainingFiles.length === 0) {
                await fs.rmdir(sourceDir);
                sourceDirDeleted = true;
            }
        } catch (error: any) {
            console.log(`删除空目录失败: ${error.message}`);
        }

        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    type: 'success',
                    data: {
                        operation: isDirectory ? '重命名文件夹' : '重命名文件',
                        source: args.source,
                        destination: args.destination,
                        sourceDirDeleted: sourceDirDeleted
                    }
                })
            }]
        };
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            throw new Error(`源路径不存在: ${args.source}`);
        }
        throw new Error(`重命名失败: ${error.message}`);
    }
};

// 删除文件或目录
export const deleteFileSchema = deleteSchema.shape;
export const deleteFileHandler = async (
    args: z.infer<typeof deleteSchema>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
) => {
    try {
        const stats = await fs.stat(args.path);
        if (stats.isDirectory()) {
            await fs.rm(args.path, { recursive: true });
        } else {
            await fs.unlink(args.path);
        }
        return {
            content: [{
                type: "text" as const,
                text: `成功删除: ${args.path}`
            }]
        };
    } catch (error: any) {
        throw new Error(`删除失败: ${error.message}`);
    }
};

// 读取文件结构
export const readStructureSchema = structureSchema.shape;
export const readStructureHandler = async (
    args: z.infer<typeof structureSchema>,
    extra: RequestHandlerExtra<ServerRequest, ServerNotification>
) => {
    try {
        const depth = args.depth ?? Infinity;

        async function readDir(dirPath: string, currentDepth: number): Promise<any> {
            if (currentDepth <= 0) return null;

            const items = await fs.readdir(dirPath);
            const results = await Promise.all(
                items
                    .filter(item => !item.startsWith('.')) // 过滤掉隐藏文件
                    .map(async (item) => {
                        const fullPath = path.join(dirPath, item);
                        const stats = await fs.stat(fullPath);
                        const result: any = {
                            name: item,
                            path: fullPath,
                            isDirectory: stats.isDirectory(),
                            size: stats.size,
                            modifiedTime: stats.mtime
                        };

                        if (stats.isDirectory() && currentDepth > 1) {
                            result.children = await readDir(fullPath, currentDepth - 1);
                        }

                        return result;
                    })
            );

            return results.filter(Boolean); // 过滤掉 null 结果
        }

        const structure = await readDir(args.path, depth);
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify(structure)
            }]
        };
    } catch (error: any) {
        throw new Error(`读取文件结构失败: ${error.message}`);
    }
}; 