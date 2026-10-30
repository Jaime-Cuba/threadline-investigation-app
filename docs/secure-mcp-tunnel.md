# Secure MCP Tunnel setup

Threadline already has a local MCP server at `http://127.0.0.1:8787/mcp`. The secure tunnel is created by OpenAI's official `tunnel-client`; it is not implemented as application code in this repository.

The tunnel keeps the local MCP server private. `tunnel-client` makes an outbound HTTPS connection to OpenAI, polls for MCP requests, forwards them to Threadline locally, and returns the responses.

## Prerequisites

You need:

- A `tunnel_id` created in OpenAI Platform tunnel settings.
- A runtime API key for `tunnel-client`.
- Tunnels Read + Use permission to run the client.
- Permission to add custom MCP apps in the target ChatGPT workspace.
- The Platform organization and ChatGPT workspace associated with the tunnel.

Do not paste the runtime key into chat, source code, screenshots, or committed configuration.

## Start Threadline

In one terminal:

```bash
npm run dev --workspace @threadline/mcp-server
```

Confirm the local server is healthy:

```bash
curl http://127.0.0.1:8787/health
```

## Configure the official client

Download the current `tunnel-client` from the Platform tunnel settings page or the official OpenAI release. Then enter the key locally in the shell:

```bash
export CONTROL_PLANE_API_KEY="<enter-locally>"
```

Create a local profile. Replace the tunnel ID with the one from Platform:

```bash
tunnel-client init \
  --sample sample_mcp_http_local \
  --profile threadline-local \
  --tunnel-id "<tunnel-id>" \
  --mcp-server-url http://127.0.0.1:8787/mcp
```

Validate it:

```bash
tunnel-client doctor --profile threadline-local --explain
```

Run it and keep this process open while testing ChatGPT:

```bash
tunnel-client run --profile threadline-local
```

The client should report that it is healthy, ready, and polling.

## Connect from ChatGPT

1. Open ChatGPT Plugins or the workspace custom-app settings.
2. Choose **Add custom MCP server**.
3. Choose **Tunnel** under Connection.
4. Select the associated Threadline tunnel.
5. Configure authentication if the workspace requires it.
6. Create the app and inspect the discovered `render_investigation` tool and `threadline-investigation` prompt.
7. Run the live demo prompt from `docs/live-chatgpt-demo.md`.

## Common blockers

- **Tunnel not visible:** the tunnel is associated only with the Platform organization, not the target ChatGPT workspace.
- **Tunnels access required:** ask the Platform organization owner or RBAC administrator for Tunnels Read + Use.
- **Custom app unavailable:** ask the ChatGPT workspace admin for permission to add custom MCP apps.
- **Tool calls fail:** keep `tunnel-client run` running and rerun `tunnel-client doctor`.
- **Workspace association cannot be verified:** the Platform organization and ChatGPT workspace may need an approved association.

## Demo boundary

The Threadline MCP server currently renders structured evidence supplied by ChatGPT. It does not store Slack, Jira, or Confluence data and does not make writes to those systems.
