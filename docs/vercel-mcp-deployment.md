# Deploy the MCP server to Vercel

Vercel can host the Threadline MCP endpoint over HTTPS without a local tunnel. This is the fastest demo path when a Secure MCP Tunnel ID or runtime API key is not available.

## What this deploys

- `GET /health` — a simple deployment check.
- `POST /mcp` — the Streamable HTTP MCP endpoint used by ChatGPT.
- The existing Threadline widget and `render_investigation` tool.

The current MCP server uses synthetic investigation data and does not contain Slack, Jira, Confluence, or other credentials.

## Deploy

1. Create or select an approved internal Vercel project.
2. Import the GitHub repository and select the `codex/investigation-api` branch.
3. Set the project root directory to `apps/mcp-server`.
4. Use the `Other` framework preset. The project has no static output directory.
5. Deploy with the default install command and `npm run build` as the build command if Vercel asks for one.
6. Verify `https://<project>.vercel.app/health` returns `{\"ok\":true,\"service\":\"threadline-mcp\"}`.
7. Use `https://<project>.vercel.app/mcp` as the MCP server URL when adding the custom app in ChatGPT.

## Important boundary

Use an Attentive-approved, access-controlled Vercel project for internal demos. Do not make this public while it is connected to real customer data. For live Slack/Jira/Confluence access, the next step is adding approved server-side connectors or a company-managed service boundary; Vercel hosting alone does not grant access to those systems.
