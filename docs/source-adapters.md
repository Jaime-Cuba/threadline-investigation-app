# Source adapter plan

Threadline currently uses synthetic sources so the investigation flow can be tested without credentials or customer data. Each source implements the same `InvestigationSource` contract:

```ts
type InvestigationSource = {
  name: "slack" | "jira" | "confluence";
  displayName: string;
  status: "fixture" | "planned" | "no_results" | "error";
  search: (input: InvestigationInput) => Promise<Evidence[]>;
};
```

## Current sources

- `fixtureSlackSource` — synthetic Slack discussion evidence.
- `fixtureJiraSource` — synthetic Jira ticket evidence.
- `fixtureConfluenceSource` — synthetic custom-work/documentation evidence.

## Connector swap plan

When access is ready, replace a fixture source with a server-side adapter that:

1. Receives the customer and problem statement.
2. Performs a read-only, request-scoped search.
3. Normalizes results into `Evidence` records.
4. Returns source-level errors without hiding the failure.

The UI and investigation result contract should not need to change when a connector is introduced.

## Demo safety

Do not add tokens, customer data, or source exports to this repository. Live adapters must use server-side managed credentials, remain read-only, and run behind authenticated internal hosting before they are used with real records.
