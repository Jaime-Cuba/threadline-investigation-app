import { fixtureConfluenceSource, fixtureJiraSource, fixtureSlackSource } from "./sources";
import { buildSourceStatus, normalizeEvidence, runSources } from "./orchestrator";
import { Evidence, InvestigationInput, InvestigationOptions, InvestigationResult, InvestigationSource, SourceName } from "./types";

export * from "./types";

const sourceRegistry: Record<SourceName, InvestigationSource> = {
  slack: fixtureSlackSource,
  jira: fixtureJiraSource,
  confluence: fixtureConfluenceSource,
};

function buildSummary(input: InvestigationInput, evidence: Evidence[]) {
  if (evidence.length === 0) {
    return `No matching history was found for ${input.customer} yet. Try adding a product, integration, ticket number, or error message to the question.`;
  }

  return `${input.customer} may have two related issues: profile matching can trigger duplicate welcome behavior, while a Bloomreach postback may be failing separately.`;
}

function buildKnownFacts(evidence: Evidence[]) {
  return evidence.filter((item) => item.relevance === "high").map((item) => item.excerpt);
}

function buildUnclearItems(evidence: Evidence[]) {
  const unclear = [
    "It is not confirmed whether the old profile-matching workaround is still active.",
    "The historic fix is not proof that the current customer configuration is resolved.",
  ];

  if (!evidence.some((item) => item.source === "slack")) {
    unclear.push("No related Slack discussion matched this question.");
  }

  return unclear;
}

export async function investigate(input: InvestigationInput, options: InvestigationOptions = {}): Promise<InvestigationResult> {
  const selectedNames = options.sourceNames?.length ? options.sourceNames : Object.keys(sourceRegistry) as SourceName[];
  const sources = selectedNames.map((name) => sourceRegistry[name]);
  const runs = await runSources(input, sources);
  const evidence = normalizeEvidence(runs);
  const { sourceStatus, sourceErrors } = buildSourceStatus(runs);

  return {
    ...input,
    generatedAt: new Date().toISOString(),
    summary: buildSummary(input, evidence),
    knownFacts: buildKnownFacts(evidence),
    unclearItems: buildUnclearItems(evidence),
    suggestedNextSteps: [
      "Confirm whether the profile-matching workaround is still active.",
      "Collect one recent example of the failed Bloomreach postback.",
      "Keep identity and delivery issues separate during the investigation.",
    ],
    evidence,
    sourceStatus,
    sourceErrors,
    sources: Object.values(sourceRegistry).map((source) => ({ name: source.displayName, status: sourceStatus[source.name] ?? "no_results" })),
  };
}
