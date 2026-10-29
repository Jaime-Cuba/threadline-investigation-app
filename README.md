# Threadline Investigation App

Threadline reconstructs a customer's technical history into a clear investigation brief.

## Current scope

- Public demo surface; no authentication yet.
- Synthetic Jellycat investigation fixtures only.
- Thin web UI and `POST /api/investigate` contract.
- Connector-backed reads will be added after the demo flow is stable.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Repository boundaries

- `apps/web` — Next.js UI and API routes.
- `packages/investigation-core` — channel-neutral investigation types and logic.
- `fixtures` — synthetic demo data only.
- `docs` — architecture and integration notes.

## Public-demo safety

This repository and the deployed demo may be public. Do not commit customer data, internal source links, access tokens, API keys, screenshots, or production configuration.
