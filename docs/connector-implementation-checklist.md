# Connector implementation checklist

This is the smallest path from the current fixture-backed sources to read-only live sources.

## Slack adapter

- [ ] Confirm the approved connection method and server-side credential path.
- [ ] Search only the selected customer/problem scope.
- [ ] Retrieve matching thread replies, not just parent messages.
- [ ] Normalize each result into `Evidence` with a permalink, author, timestamp, and excerpt.
- [ ] Return `error` status when Slack is unavailable; do not silently return an empty result.
- [ ] Redact secrets and avoid logging full message bodies.

## Jira / Atlassian adapter

- [ ] Confirm the approved connection method and server-side credential path.
- [ ] Search issue summaries, descriptions, comments, and linked issues.
- [ ] Normalize each result into `Evidence` with issue key, status, timestamp, and URL.
- [ ] Preserve the distinction between closed, unresolved, and waiting-for-customer issues.
- [ ] Return `error` status when Jira is unavailable; do not silently return an empty result.

## Validation before live data

- [ ] Keep the API read-only.
- [ ] Move the demo behind authenticated internal hosting before using real records.
- [ ] Use request-scoped searches and do not add a persistent customer-data store.
- [ ] Test no results, source timeout, partial source failure, and conflicting history.
- [ ] Keep the fixture sources available as a deterministic fallback for the demo.

The UI should not change when these adapters are introduced. Only the source registry and adapter implementations should change.
