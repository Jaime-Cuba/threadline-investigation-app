# Threadline ChatGPT app server

This package exposes a small MCP server for the ChatGPT Apps SDK path. ChatGPT can call `render_investigation` after it gathers relevant evidence from connected Slack, Jira, and Confluence apps. The tool returns structured investigation data and renders the Threadline widget inside the conversation.

## Local development

```bash
npm run dev --workspace @threadline/mcp-server
```

The local endpoints are:

- Health: `http://localhost:8787/health`
- MCP: `http://localhost:8787/mcp`

The server exposes a `threadline-investigation` prompt to guide the connected-app search and a `render_investigation` tool to display the final result.

The MCP endpoint is not a browser page. It accepts JSON-RPC `POST` requests. Verify the handshake with:

```bash
curl -sS -X POST http://localhost:8787/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"threadline-check","version":"0.1.0"}}}'
```

ChatGPT cannot connect directly to an arbitrary local URL. Use an approved HTTPS deployment or Secure MCP Tunnel when testing the app in ChatGPT.

## Demo prompt

> Investigate the Jellycat duplicate-profile and Bloomreach issue. Use the connected Slack, Jira, and Confluence apps to find relevant history, separate confirmed facts from unknowns, and render the result using Threadline.

## Deliberate boundary

This server does not read Slack, Jira, or Confluence itself. It accepts evidence supplied by the ChatGPT orchestration step and renders it. This is the demo version of Option A; direct OAuth-backed source adapters remain a later implementation.
