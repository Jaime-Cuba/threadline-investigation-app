import { Evidence, EvidenceKind, InvestigationInput, InvestigationSource, SourceName, SourceStatus } from "./types";

export type SourceRun = {
  source: InvestigationSource;
  evidence: Evidence[];
  status: SourceStatus;
  error?: string;
};

function errorMessage(source: InvestigationSource, error: unknown) {
  // Deliberately do not echo provider details. They may contain URLs, tokens,
  // or implementation details that are not useful to a customer-facing user.
  void error;
  return `${source.displayName} search failed.`;
}

function isEvidence(value: unknown, sourceName: SourceName): value is Evidence {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Evidence>;
  const kinds: EvidenceKind[] = ["discussion", "ticket", "documentation", "custom_work"];
  return typeof item.id === "string" && item.source === sourceName &&
    typeof item.kind === "string" && kinds.includes(item.kind as EvidenceKind) && typeof item.title === "string" &&
    typeof item.excerpt === "string" && typeof item.relevance === "string" &&
    ["high", "medium", "low"].includes(item.relevance) &&
    typeof item.timestamp === "string" && typeof item.whyItMatters === "string";
}

export async function runSources(input: InvestigationInput, sources: InvestigationSource[]): Promise<SourceRun[]> {
  return Promise.all(sources.map(async (source) => {
    try {
      const result = await source.search(input);
      if (!Array.isArray(result)) throw new Error("adapter returned a non-array result");
      const evidence = result.filter((item) => isEvidence(item, source.name));
      if (evidence.length !== result.length) throw new Error("adapter returned malformed evidence");
      return { source, evidence, status: evidence.length > 0 ? source.status : "no_results" };
    } catch (error) {
      return { source, evidence: [], status: "error", error: errorMessage(source, error) };
    }
  }));
}

export function normalizeEvidence(runs: SourceRun[]) {
  const unique = new Map<string, Evidence>();
  for (const run of runs) {
    for (const item of run.evidence) {
      const key = `${item.source}:${item.title.toLowerCase()}:${item.timestamp}`;
      if (!unique.has(key)) unique.set(key, item);
    }
  }

  const relevance: Record<Evidence["relevance"], number> = { high: 0, medium: 1, low: 2 };
  return Array.from(unique.values()).sort((left, right) => relevance[left.relevance] - relevance[right.relevance]);
}

export function buildSourceStatus(runs: SourceRun[]) {
  const sourceStatus = runs.reduce<Record<SourceName, SourceStatus>>((status, run) => {
    status[run.source.name] = run.status;
    return status;
  }, { slack: "no_results", jira: "no_results", zendesk: "no_results", confluence: "no_results" });
  const sourceErrors = runs.reduce<Partial<Record<SourceName, string>>>((errors, run) => {
    if (run.error) errors[run.source.name] = run.error;
    return errors;
  }, {});

  return { sourceStatus, sourceErrors };
}
