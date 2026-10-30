# Threadline Investigation App

Threadline reconstructs a customer's technical history into a clear investigation brief.

## Current scope

- Public demo surface; no authentication yet.
- Synthetic Slack-, Jira-, and Confluence-shaped investigation fixtures.
- Thin web UI and `POST /api/investigate` contract.
- Connector-ready source adapter interface; live reads are intentionally deferred.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Repository boundaries

- `apps/web` — Next.js UI and API routes.
- `apps/mcp-server` — ChatGPT Apps SDK/MCP server and embedded Threadline widget.
- `packages/investigation-core` — channel-neutral investigation types and logic.
- `packages/investigation-core/src/sources.ts` — source adapter implementations.
- `fixtures` — synthetic demo data only.
- `docs` — architecture and integration notes.

## ChatGPT app prototype

The ChatGPT-facing prototype is a remote MCP server. ChatGPT gathers source context using the connected apps available in the workspace, then calls Threadline's `render_investigation` tool to display the result inside the conversation. See [apps/mcp-server/README.md](apps/mcp-server/README.md).

## Public-demo safety

This repository and the deployed demo may be public. Do not commit customer data, internal source links, access tokens, API keys, screenshots, or production configuration.
