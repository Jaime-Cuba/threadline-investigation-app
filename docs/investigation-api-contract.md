# Investigation API contract

The investigation endpoint is source-agnostic. The UI consumes one stable
response whether the backing source is a fixture or a future live Slack, Jira,
or Confluence adapter.

## Request

`POST /api/investigate`

```json
{
  "customer": "Jellycat",
  "question": "Why are duplicate welcome messages being sent?",
  "sources": ["slack", "jira", "confluence"]
}
```

`customer` and `question` are required strings. `question` is limited to 500
characters and `customer` to 120 characters. `sources` is optional; when
omitted, all supported sources run. When supplied, it must contain at least one
of `slack`, `jira`, or `confluence`. Duplicate source names are removed while
preserving their first-seen order.

## Response behavior

The response keeps the existing Threadline result shape:

- `evidence` contains normalized, de-duplicated evidence sorted by relevance.
- `sourceStatus` reports each source as `fixture`, `no_results`, or `error`.
- `sourceErrors` contains only sources that failed, with short diagnostics.
- `sources` is the display-friendly source summary used by the UI.

Source failures are isolated. If Slack fails but Jira returns evidence, the
request still succeeds with Jira evidence and `sourceStatus.slack = "error"`.
An adapter returning malformed data is treated as a source error rather than
being allowed to corrupt the investigation response.

## Adapter boundary

Each adapter implements `InvestigationSource`:

```ts
{
  name: "slack",
  displayName: "Slack",
  status: "fixture",
  search(input): Promise<Evidence[]>
}
```

The source registry in `packages/investigation-core/src/sources.ts` is the
resolution boundary. Replacing a fixture with a live adapter should not
require changes to the orchestrator, route, or UI. Live adapters should return
normalized `Evidence` fields and throw on provider/authentication failures so
the orchestrator can report a partial result safely.

## HTTP errors

- `400`: invalid JSON or request fields.
- `502`: orchestration failed before a normal investigation result could be
  produced.
- `200`: the investigation result, including partial results and source-level
  errors.
