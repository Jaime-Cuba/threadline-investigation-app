# Threadline project guidance

## Project

- **Purpose:** Threadline turns a customer problem into a clear investigation brief. It brings together relevant history, uncertainty, evidence, and suggested next steps so customer-facing teams do not start from a blank page.
- **Primary stack:** TypeScript, Next.js App Router, React, and a small channel-neutral investigation core in `packages/investigation-core`.
- **Current mode:** Public demo, no authentication, synthetic data only. Do not add real customer data or live credentials to this repository.
- **Source of truth:** Read the repository as it exists. Preserve established patterns unless the task explicitly changes them.
- **Important context:** Read `docs/architecture.md` when changing the investigation contract, source adapters, or deployment shape. Read `README.md` for setup and public-demo boundaries.

## Core principles

- **Simple is better.** Choose the smallest design that solves the current problem. Avoid speculative abstractions, extra services, new dependencies, and framework changes.
- **Break problems down.** Split work into small vertical slices. Make one useful path work end to end before adding secondary features.
- **Keep the UI thin.** The UI should collect a question and render a structured investigation result. Investigation logic belongs in the core or API layer.
- **Keep the core channel-neutral.** The same investigation contract should support the web UI, a future ChatGPT App, and a future Slack experience.
- **Prefer structured data over prose.** Return typed summaries, evidence, sources, unknowns, and next steps. Generate presentation copy at the boundary.
- **Make uncertainty visible.** Never treat a closed ticket, old workaround, or missing source as proof that a problem is resolved.
- **Use reversible decisions.** Prefer code that can be replaced or extended without migrating a large system.
- **Clarity beats cleverness.** Use direct names, small functions, explicit types, and comments only where they explain a non-obvious decision.

## Working rules

- Start with a lightweight read-only orientation: inspect relevant files, scripts, types, and existing conventions before editing.
- Make the smallest focused change that satisfies the request. Do not combine unrelated cleanup with feature work.
- Reuse existing components, types, scripts, and dependencies before introducing alternatives.
- Preserve existing behavior unless the request explicitly changes it.
- Make reasonable assumptions when they are low-risk. Surface a decision first when different answers would materially change the implementation.
- Do not invent APIs, connector capabilities, requirements, or test results. Verify them in the repository or authoritative documentation.

## Public-demo safety

- This repository may be public. Never commit secrets, tokens, API keys, private URLs, customer PII, internal screenshots, or production configuration.
- Use synthetic fixtures under `fixtures/` for demos and tests.
- Keep `.env` and `.env.local` untracked. Document variable names only in `.env.example`.
- The no-auth demo is intentional for exploration only. Do not add real connector access behind an unauthenticated route.
- When live reads are introduced, keep source access read-only, request-scoped, and visible in the result. Do not proxy arbitrary provider requests from the browser.

## Implementation and verification

- Keep the investigation contract in `packages/investigation-core` and expose it through the API route in `apps/web`.
- Add or update types before wiring UI behavior that depends on them.
- Prefer one source adapter at a time. Normalize source results before synthesis or rendering.
- Keep source-level failures separate. A failed Slack search must not look like “no evidence found.”
- After edits, run the narrowest relevant checks first:

  ```bash
  npm run typecheck
  npm run build
  ```

- For UI changes, run `npm run dev` and verify the changed path in a browser when practical.
- For API changes, exercise the affected route with a representative request and inspect the response shape.
- Do not claim a check passed unless it was actually run. Report blocked checks and the exact reason.
- Review the diff before finishing. Remove debug output, temporary files, unused code, and accidental formatting churn.

## Current commands

- `npm install` — install dependencies.
- `npm run dev` — start the local web app.
- `npm run typecheck` — type-check the web app and investigation core.
- `npm run build` — create a production build for the web app.

## Non-goals for the first public demo

- No multi-agent architecture.
- No vector database or background indexing pipeline.
- No writes to Jira, Slack, Gmail, or other source systems.
- No production customer data.
- No broad refactor before the core investigation flow works.

## Completion checklist

Before declaring a task complete:

1. The requested behavior is implemented in the appropriate existing location.
2. The changed path was verified with repository commands or a documented manual check.
3. Type checks, builds, and affected tests were run when available.
4. The diff is focused and contains no secrets or debug code.
5. The final summary names changed files, verification performed, assumptions, known limitations, and the next sensible step.
