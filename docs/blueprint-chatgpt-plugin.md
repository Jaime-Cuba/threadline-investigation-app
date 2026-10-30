# Blueprint + Threadline ChatGPT plugin workflow

## First useful version

The user asks ChatGPT to investigate a recurring wrong-product-image issue. ChatGPT first asks up to three focused clarifying questions when needed, then searches the connected Slack, Jira, Zendesk, and Confluence apps. It reconciles the timeline and calls Threadline's read-only rendering tool.

The rendered brief should distinguish:

- Original diagnosis
- Recommended catalog change
- Closed escalation
- Later recurrence
- Temporary journey suppression
- Newer contradictory source-system evidence

## Source and safety boundary

Threadline does not retrieve source records directly in this version. ChatGPT uses the user's connected apps, then passes a structured evidence bundle to the MCP server. The plugin does not create, update, close, or comment on records.

The result should contain account-level technical context and omit subscriber-level or consumer PII. Prompt instructions guide behavior but do not replace source permissions or server-side authorization.

## Test prompt

```text
Investigate the recurring wrong-product-image issue for [customer]. Search connected Slack, Jira, Zendesk, and Confluence sources. Find the original diagnosis, recommended catalog change, closed escalation, later recurrence, temporary journey suppression, and newer contradictory source-system evidence. Separate confirmed facts from unknowns and do not claim the issue was fixed unless current evidence proves it. Render the result using Threadline.
```
