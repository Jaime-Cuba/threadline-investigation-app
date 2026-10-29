import * as z from "zod/v4";
import type { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { WIDGET_URI, widgetHtml } from "./widget.js";

const evidenceSchema = z.object({
  id: z.string(),
  source: z.enum(["slack", "jira", "confluence"]),
  kind: z.string(),
  title: z.string(),
  excerpt: z.string(),
  relevance: z.enum(["high", "medium", "low"]),
  status: z.string().optional(),
  author: z.string().optional(),
  timestamp: z.string(),
  whyItMatters: z.string(),
});

function createServer() {
  const server = new McpServer({ name: "threadline-investigation", version: "0.1.0" });

  server.registerResource("threadline-investigation-ui", WIDGET_URI, { mimeType: "text/html;profile=mcp-app" }, async () => ({
    contents: [{
      uri: WIDGET_URI,
      mimeType: "text/html;profile=mcp-app",
      text: widgetHtml,
      _meta: { ui: { prefersBorder: true } },
    }],
  }));

  server.registerPrompt("threadline-investigation", {
    description: "Guide ChatGPT through a customer investigation using connected Slack, Jira, and Confluence apps before rendering Threadline.",
    argsSchema: {
      customer: z.string().describe("Customer or account name"),
      question: z.string().describe("Customer problem to investigate"),
    },
  }, async ({ customer, question }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Investigate ${customer}: ${question}\n\nFirst search the connected Slack, Jira, and Confluence apps for relevant history. Reconcile the results and separate confirmed facts, unknowns, and conflicting information. Then call Threadline's render_investigation tool with the final plain-language summary, suggested next steps, and source evidence. Do not invent records or imply that an old workaround is still active without evidence.`,
      },
    }],
  }));

  server.registerTool("render_investigation", {
    title: "Render Threadline investigation",
    description: "Render a Threadline investigation after gathering relevant evidence from connected Slack, Jira, and Confluence apps. Use only evidence returned by those sources. Clearly preserve unknowns and conflicting information; never invent source records.",
    inputSchema: {
      customer: z.string().describe("Customer or account name"),
      question: z.string().describe("The original investigation question"),
      summary: z.string().describe("Plain-language summary of the investigation"),
      knownFacts: z.array(z.string()).describe("Confirmed facts supported by the source evidence"),
      unclearItems: z.array(z.string()).describe("Unknown, conflicting, or unverified items"),
      suggestedNextSteps: z.array(z.string()).describe("Recommended next investigation steps"),
      evidence: z.array(evidenceSchema).describe("Relevant source records from connected apps"),
    },
    _meta: {
      ui: { resourceUri: WIDGET_URI },
      "openai/toolInvocation/invoking": "Preparing Threadline investigation…",
      "openai/toolInvocation/invoked": "Threadline investigation ready",
    },
  }, async (input) => ({
    structuredContent: input,
    content: [{ type: "text", text: `Threadline investigation ready for ${input.customer}.` }],
  }));

  return server;
}

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
