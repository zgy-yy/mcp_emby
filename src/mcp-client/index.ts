import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { OpenAI } from "openai";
import type { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from "openai/resources/chat/completions";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { AIMessage, ToolResult } from "../types/mcp";

const DEEPSEEK_API_KEY = "sk-e02749c3555f4408b8159460c4edef85"

export class McpClient {
    private client: Client;
    private openai: OpenAI;
    private transport: StreamableHTTPClientTransport | null = null;
    private tools: any[] = [];

    constructor() {
        this.openai = new OpenAI({
            apiKey: DEEPSEEK_API_KEY,
            baseURL: "https://api.deepseek.com",
            dangerouslyAllowBrowser: true
        });

        this.client = new Client({
            name: "emby-filem",
            version: "1.0.0"
        });
    }

    async connectToServer(serverUrl: string) {
        try {
            const baseUrl = window.location.origin;
            const url = new URL(serverUrl, baseUrl);
            this.transport = new StreamableHTTPClientTransport(url);
            await this.client.connect(this.transport);

            const toolsResult = await this.client.listTools();
            this.tools = toolsResult.tools.map((tool) => ({
                type: "function",
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.inputSchema
                }
            }));
            console.log(`Connected to server with tools:\n`, this.tools);

        } catch (e) {
            throw e;
        }
    }


    async queryAI(messages: ChatCompletionMessageParam[]): Promise<[string, ChatCompletionMessageToolCall[]]> {
        const response = await this.openai.chat.completions.create({
            model: "deepseek-chat",
            messages: messages,
            tools: this.tools,
        });
        let currentMessage = response.choices[0].message.content ?? '';
        let currentToolCalls: Array<ChatCompletionMessageToolCall> = response.choices[0].message.tool_calls ?? [];
        return [currentMessage, currentToolCalls];
    }

    messages: ChatCompletionMessageParam[] = [
        {
            role: "system", content: `你是一个专业的媒体文件整理助手。请按照 Emby 命名规则整理文件。
命名规则如下：

1. 电影命名规则：
   - 格式：电影名称 (年份)/电影名称 (年份).扩展名
   - 示例：The Matrix (1999)/The Matrix (1999).mkv
   - 注意：需要从文件名中提取年份，如果文件名中没有年份，需要从文件名中删除无关信息

2. 电视剧命名规则：
   - 格式：剧集名称/Season XX/剧集名称 - SXXEYY - 集标题.扩展名
   - 示例：Breaking Bad/Season 01/Breaking Bad - S01E01 - Pilot.mkv
   - 注意：需要从文件名中提取季数和集数，如果文件名中没有这些信息，需要从文件名中删除无关信息

3. 动画剧集命名规则：
   - 格式：动画名称/Season XX/动画名称 - SXXEYY - 集标题.扩展名
   - 示例：Attack on Titan/Season 01/Attack on Titan - S01E01 - To You, in 2000 Years.mkv

4. 纪录片命名规则：
   - 格式：纪录片名称/Season XX/纪录片名称 - SXXEYY - 集标题.扩展名
   - 示例：Planet Earth/Season 01/Planet Earth - S01E01 - From Pole to Pole.mkv

5. 音乐视频命名规则：
   - 格式：艺术家名称/专辑名称/艺术家名称 - 歌曲名称.扩展名
   - 示例：Michael Jackson/Thriller/Michael Jackson - Thriller.mkv


通用规则：
1. 文件夹名称要包含年份（对于电影）
2. 季数使用 "Season XX" 格式（XX 为两位数）
3. 集数使用 "SXXEYY" 格式（XX 为季数，YY 为集数）
4. 集标题要使用英文，避免特殊字符
5. 文件扩展名要小写
6. 避免使用特殊字符，如：\\ / : * ? " < > |
7. 使用空格而不是下划线或点号
8. 多季剧集要放在对应的季文件夹中
9. 删除文件名中的无关信息，如：字幕组信息、分辨率信息、编码信息和网站信息等

输出格式要求：

1. 当需要返回文件调整结构时：
{
    type: 'files_sorting',
    data: [
            {
                ori_name: '文件夹/文件名',
                new_name: '文件夹/文件名'
            }
        ]
    }
}
只需要返回旧文件名或目录名和新的文件名或目录名，不需要完整的路径

2. 当需要返回普通消息时：
{
    type: 'prompt'|'confirm'|'error'|'success',
    data: '消息内容'
}

3. 当需要调用工具时：
{
    type: 'call_tools',
    data: {
        action: '要执行的操作描述',
    }
}

注意事项：
1. 所有输出必须是合法的JSON格式
2. 每次输出都需要包含type和data字段
3. 当需要用户确认时，使用confirm类型
4. 当发生错误时，使用error类型
5. 当操作成功时，使用success类型
6. 当需要展示目录结构时，使用files_sorting类型
7. 当需要调用工具时，使用call_tools类型
8. 当需要提示用户时，使用prompt类型

请严格按照我指定的格式输出，不要输出任何其他内容。也不要一次输出多种类型，一次只输出一种类型。
请注意不要输出任何额外的文本或解释，只输出JSON格式的内容。
如果需要我确认，请输出确认信息。
当我确认重命名时，根据之前的重命名信息。调用calltools执行重命名操作。
你应该先处理文件，再处理文件夹，防止出现文件夹被改名，找不到路径问题。
如果没有需要重命名的文件，或者新名字和原名字一样，请输出success类型。
如果已经有正确的文件名，请重命名
在原来的目录里进行重命名，无需向我进行询问。` },
    ];
    async processMessage(query: string, onChunk: (res: AIMessage) => void): Promise<AIMessage> {
        this.messages.push({ role: "user", content: query })
        const toolResults: ToolResult[] = [];
        const [currentMessage, currentToolCalls] = await this.queryAI(this.messages)

        for (const toolCall of currentToolCalls) {
            onChunk({
                type: 'call_tools',
                data: {
                    action: toolCall.function.name
                }
            })
            const toolResult: ToolResult = await this.client.callTool({
                name: toolCall.function.name,
                arguments: JSON.parse(toolCall.function.arguments) as { [x: string]: unknown }
            }) as ToolResult;
            toolResults.push(toolResult)
            console.log(`Tool Result: ${toolCall.function.name} ${toolCall.id} \n`, toolResult)
        }
        if (currentToolCalls.length > 0) {
            this.messages.push({
                role: "assistant",
                content: currentMessage,
                tool_calls: currentToolCalls.map((toolCall) => ({
                    id: toolCall.id,
                    type: "function",
                    function: {
                        name: toolCall.function.name,
                        arguments: toolCall.function.arguments
                    }
                }))
            })
        } else {
            this.messages.push({
                role: "assistant",
                content: currentMessage
            })
            return JSON.parse(currentMessage)
        }
        currentToolCalls.forEach((toolCall, index) => {
            this.messages.push({
                role: "tool",
                content: JSON.stringify(toolResults[index], null, 2),
                tool_call_id: toolCall.id
            })
        })
        const res = await this.queryAI(this.messages).then(res => {
            let [message, _] = res
            const result = JSON.parse(message)
            return result
        }).catch(e => {
            console.log(e)
            return null
        })
        return res
    }

    refreshMessages() {
        this.messages.shift();
    }

    async getFileStructure(path: string) {
        const structure = await this.client.callTool({
            name: "read_structure",
            arguments: { path: path }
        })
        return structure as ToolResult
    }


    async disconnect() {
        await this.client.close();
        this.transport = null;
    }
}