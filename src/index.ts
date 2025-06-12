import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";


interface ToolCall {
    index: number;
    id: string;
    function: {
        name: string;
        arguments: string;
    };
}

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
            console.log(`Connected to server with tools:`, this.tools);

        } catch (e) {
            throw e;
        }
    }


    async queryAI(messages: ChatCompletionMessageParam[], onChunk: (chunk: any) => void): Promise<[string, ToolCall[]]> {
        const response = await this.openai.chat.completions.create({
            model: "deepseek-chat",
            messages: messages,
            tools: this.tools,
            stream: true
        });
        let currentMessage = '';
        let currentToolCalls: Array<ToolCall> = [];
        for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            const tool_calls = chunk.choices[0]?.delta?.tool_calls;
            if (content) {
                currentMessage += content;
                onChunk(currentMessage);
            }
            if (tool_calls) {
                if (currentToolCalls.length == 0) {
                    currentToolCalls = tool_calls.map((_, index) => {
                        return {
                            index: index,
                            id: '',
                            function: {
                                name: '',
                                arguments: ''
                            }
                        }
                    });
                }
                for (const index in tool_calls) {
                    currentToolCalls[index].id += tool_calls[index]?.id ?? '';
                    currentToolCalls[index].function.arguments += tool_calls[index]?.function?.arguments ?? '';
                    currentToolCalls[index].function.name += tool_calls[index]?.function?.name ?? '';
                }
            }
        }
        return [currentMessage, currentToolCalls];
    }

    messages: ChatCompletionMessageParam[] = [
        { role: "system", content: "你是一个专业的媒体文件整理助手。请按照 Emby 命名规则整理文件。请使用提供的工具来整理文件。" },
    ];
    async processMessage(query: string, onChunk: (res: string) => void) {
        this.messages.push({ role: "user", content: query })
        const toolResults: any[] = [];
        const [currentMessage, currentToolCalls] = await this.queryAI(this.messages, onChunk)
        for (const toolCall of currentToolCalls) {
            const toolResult = await this.client.callTool({
                name: toolCall.function.name,
                arguments: JSON.parse(toolCall.function.arguments) as { [x: string]: unknown }
            });
            console.log(`Tool Result: ${toolCall.function.name} ${toolCall.id}`, toolResult)
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
        }
        currentToolCalls.forEach((toolCall) => {
            this.messages.push({
                role: "tool",
                content: JSON.stringify(toolResults, null, 2),
                tool_call_id: toolCall.id
            })
        })
        this.queryAI(this.messages, onChunk)
        return currentMessage
    }

    async disconnect() {
        await this.client.close();
        this.transport = null;
    }
}