import { jellycatEvidence } from "./fixtures";
import { Evidence, InvestigationInput, InvestigationSource, SourceName } from "./types";

/** The source identifiers accepted by the investigation API. */
export const SOURCE_NAMES = ["slack", "jira", "zendesk", "confluence"] as const satisfies readonly SourceName[];

export function isSourceName(value: unknown): value is SourceName {
  return typeof value === "string" && SOURCE_NAMES.includes(value as SourceName);
}

function matchesQuery(evidence: Evidence, input: InvestigationInput) {
  const query = `${input.customer} ${input.question}`.toLowerCase();
  const terms = `${evidence.title} ${evidence.excerpt}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return terms.some((term) => term.length > 3 && query.includes(term));
}

function matchesFixture(evidence: Evidence, input: InvestigationInput) {
  return input.customer.toLowerCase().includes("jellycat") || matchesQuery(evidence, input);
}

/**
 * Factory boundary for future live adapters.
 *
 * A live Slack/Jira/Confluence adapter should implement the same
 * InvestigationSource contract and be registered here without changing the
 * orchestrator or API route.
 */
function createFixtureSource(name: SourceName, displayName: string): InvestigationSource {
  return {
    name,
    displayName,
    status: "fixture",
    async search(input) {
      return jellycatEvidence.filter(
        (evidence) => evidence.source === name && matchesFixture(evidence, input),
      );
    },
  };
}

export const fixtureSlackSource = createFixtureSource("slack", "Slack");
export const fixtureJiraSource = createFixtureSource("jira", "Jira / Atlassian");
export const fixtureZendeskSource = createFixtureSource("zendesk", "Zendesk");
export const fixtureConfluenceSource = createFixtureSource("confluence", "Confluence / Atlassian");

/** Registry used by API callers that need to resolve a requested source set. */
export const sourceRegistry: Record<SourceName, InvestigationSource> = {
  slack: fixtureSlackSource,
  jira: fixtureJiraSource,
  zendesk: fixtureZendeskSource,
  confluence: fixtureConfluenceSource,
};

/** Resolve a source selection while preserving order and removing duplicates. */
export function resolveSources(sourceNames?: readonly SourceName[]): InvestigationSource[] {
  const names = sourceNames?.length ? sourceNames : SOURCE_NAMES;
  return Array.from(new Set(names)).map((name) => sourceRegistry[name]);
}
