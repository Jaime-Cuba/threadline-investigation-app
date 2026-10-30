# Live ChatGPT orchestration demo

This runbook uses ChatGPT's connected apps directly. It does not send live Slack, Jira, or Confluence records into the repository.

## Demo prompt

```text
Investigate this customer problem: [customer] is experiencing [problem].

Use the connected Slack, Jira, and Confluence apps to find relevant technical history. Search broadly first, then narrow to the most relevant threads, tickets, and documentation.

Return the investigation in this format:

1. Plain-language summary
2. What we know
3. What is still unclear
4. Related history, grouped by source
5. Timeline
6. Suggested next steps

For every important claim, include the source name, record title or issue key, date, and link when available. Separate confirmed facts from assumptions. Do not include subscriber phone numbers, email addresses, or other sensitive customer details. Do not create or update records.
```

## Jellycat demo prompt

```text
Investigate the Jellycat issue involving duplicate or orphaned profiles and Bloomreach delivery failures.

Use Slack, Jira, and Confluence. Prioritize recent technical discussions and the most relevant Jira issues. Separate the identity-linking behavior from the Bloomreach delivery failure. Identify whether an old workaround is still confirmed to be active.

Return a CSM-friendly Threadline investigation with:
- a plain-language summary;
- confirmed facts;
- unclear or conflicting items;
- related Slack discussions, Jira issues, and Confluence documentation;
- a concise timeline;
- recommended next steps.

Use source links and record identifiers where available. Keep the result read-only and omit subscriber contact details.
```

## Demo operating rules

- Use connected apps for live research; do not paste credentials into prompts.
- Keep all searches read-only.
- Do not save live source results to this repository.
- Prefer account-level and technical context over subscriber-level details.
- If a source returns no useful result, say so instead of filling the gap with assumptions.
- For the visual demo, use the standalone Threadline site with synthetic data as the reliable fallback.
