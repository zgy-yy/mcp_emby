import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";


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

    async processMessage(query: string) {

        const messages: ChatCompletionMessageParam[] = [
            { role: "system", content: "你是一个专业的媒体文件整理助手。请按照 Emby 命名规则整理文件。请使用提供的工具来整理文件。" },
            { role: "user", content: query }
        ];

        const response = await this.openai.chat.completions.create({
            model: "deepseek-chat",
            messages: messages,
            tools: this.tools
        });
        console.log('AI Response:', response);
        const msg = response.choices[0].message;
        console.log('AI Response msg:', msg);

        const finalText = [];
        const toolResults = [];

        if (msg.tool_calls) {
            for (const toolCall of msg.tool_calls) {
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);
                console.log('call Tool :', toolName, toolArgs);
                const toolResult = await this.client.callTool({
                    name: toolName,
                    arguments: toolArgs
                });
                console.log(`Tool Result: ${toolName} ${toolCall.id}`, toolResult);

                toolResults.push(toolResult)
            }
            messages.push(msg)
            messages.push({
                role: "tool",
                content: JSON.stringify(toolResults, null, 2),
                tool_call_id: msg.tool_calls[0].id
            })

            const response = await this.openai.chat.completions.create({
                model: "deepseek-chat",
                messages: messages,
                tools: this.tools
            });
            console.log('AI Response:', response);
            finalText.push(response.choices[0].message.content)
        } else {
            finalText.push(msg.content)
        }
        return finalText
    }

    async disconnect() {
        await this.client.close();
        this.transport = null;
    }
}