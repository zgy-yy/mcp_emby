import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { 
    moveFileSchema, moveFileHandler,
    deleteFileSchema, deleteFileHandler,
    readStructureSchema, readStructureHandler
} from "./tools/file";

const app = express();
app.use(express.json());

// 创建 MCP 服务器实例
const server = new McpServer({
    name: "emby-mpc-server",
    version: "1.0.0"
});

// 注册工具
server.tool("move_file", moveFileSchema, moveFileHandler);
server.tool("delete_file", deleteFileSchema, deleteFileHandler);
server.tool("read_structure", readStructureSchema, readStructureHandler);

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

app.post("/mcp", handleMCPRequest);

app.get('/mcp', handleSessionRequest);

// Handle DELETE requests for session termination
app.delete('/mcp', handleSessionRequest);

app.listen(5321, () => {
    console.log("Server is running on port 5321");
});

async function handleMCPRequest(req: express.Request, res: express.Response) {
    try {
        // Check for existing session ID
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        let transport: StreamableHTTPServerTransport;
        
        if (sessionId && transports[sessionId]) {
            // Reuse existing transport
            transport = transports[sessionId];
        } else if (!sessionId && isInitializeRequest(req.body)) {
            // Create new transport for initialization
            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => randomUUID(),
                onsessioninitialized: (sessionId) => {
                    // Store the transport by session ID
                    transports[sessionId] = transport;
                },
                enableJsonResponse: true
            });
            
            // Clean up transport when closed
            transport.onclose = () => {
                if (transport.sessionId) {
                    delete transports[transport.sessionId];
                }
            };

            // Connect server to transport
            await server.connect(transport);
        } else {
            // Invalid request
            res.status(400).json({
                jsonrpc: '2.0',
                error: {
                    code: -32000,
                    message: 'Bad Request: No valid session ID provided',
                },
                id: null,
            });
            return;
        }

        // Handle the request
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error('Error handling MCP request:', error);
        res.status(500).json({
            jsonrpc: '2.0',
            error: {
                code: -32603,
                message: 'Internal error',
            },
            id: req.body?.id || null,
        });
    }
}

async function handleSessionRequest(req: express.Request, res: express.Response) {
    try {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        if (!sessionId || !transports[sessionId]) {
            res.status(400).send('Invalid or missing session ID');
            return;
        }

        const transport = transports[sessionId];
        await transport.handleRequest(req, res);
    } catch (error) {
        console.error('Error handling session request:', error);
        res.status(500).json({
            jsonrpc: '2.0',
            error: {
                code: -32603,
                message: 'Internal error',
            },
            id: req.body?.id || null,
        });
    }
}