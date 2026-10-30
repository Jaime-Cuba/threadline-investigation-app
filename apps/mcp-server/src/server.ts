import type { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { createServer } from "./mcp.js";

const app = createMcpExpressApp();
app.post("/mcp", async (request: Request, response: Response) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  try {
    await server.connect(transport);
    await transport.handleRequest(request, response, request.body);
    response.on("close", () => {
      void transport.close();
      void server.close();
    });
  } catch (error) {
    console.error("Threadline MCP request failed", error);
    if (!response.headersSent) {
      response.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null });
    }
  }
});

app.get("/mcp", (_request: Request, response: Response) => response.status(405).json({
  error: "The MCP endpoint accepts JSON-RPC POST requests. Use /health in a browser or run the initialize curl command in the README.",
}));

app.get("/health", (_request: Request, response: Response) => response.json({ ok: true, service: "threadline-mcp" }));

const port = Number(process.env.PORT ?? 8787);
app.listen(port, (error?: Error) => {
  if (error) {
    console.error("Threadline MCP server failed to start", error);
    process.exit(1);
  }
  console.log(`Threadline MCP server listening on http://localhost:${port}/mcp`);
});
