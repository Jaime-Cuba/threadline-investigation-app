import { Evidence, InvestigationInput, InvestigationSource, SourceName, SourceStatus } from "./types";

export type SourceRun = {
  source: InvestigationSource;
  evidence: Evidence[];
  status: SourceStatus;
  error?: string;
};

export async function runSources(input: InvestigationInput, sources: InvestigationSource[]): Promise<SourceRun[]> {
  return Promise.all(sources.map(async (source) => {
    try {
      const evidence = await source.search(input);
      return { source, evidence, status: evidence.length > 0 ? source.status : "no_results" };
    } catch {
      return { source, evidence: [], status: "error", error: `The ${source.displayName} source could not be searched.` };
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
  }, { slack: "no_results", jira: "no_results", confluence: "no_results" });
  const sourceErrors = runs.reduce<Partial<Record<SourceName, string>>>((errors, run) => {
    if (run.error) errors[run.source.name] = run.error;
    return errors;
  }, {});

  return { sourceStatus, sourceErrors };
}
