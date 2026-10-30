import { Evidence, EvidenceKind, InvestigationResult, SourceName, SourceStatus } from "./types";

const sourceNames: SourceName[] = ["slack", "jira", "zendesk", "confluence"];
const evidenceKinds: EvidenceKind[] = ["discussion", "ticket", "documentation", "custom_work"];
const relevanceValues = ["high", "medium", "low"] as const;
const sourceStatuses: SourceStatus[] = ["fixture", "planned", "no_results", "error"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(record: Record<string, unknown>, field: string) {
  const value = record[field];
  if (typeof value !== "string" || !value.trim()) throw new Error(`"${field}" must be a non-empty string.`);
  return value.trim();
}

function stringArray(record: Record<string, unknown>, field: string) {
  const value = record[field];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) throw new Error(`"${field}" must be an array of non-empty strings.`);
  return value.map((item) => item.trim());
}

function oneOf<T extends string>(record: Record<string, unknown>, field: string, values: readonly T[]) {
  const value = record[field];
  if (typeof value !== "string" || !values.includes(value as T)) throw new Error(`"${field}" has an unsupported value.`);
  return value as T;
}

function parseEvidence(value: unknown, index: number): Evidence {
  if (!isRecord(value)) throw new Error(`Evidence item ${index + 1} must be an object.`);
  return {
    id: requiredString(value, "id"), source: oneOf(value, "source", sourceNames), kind: oneOf(value, "kind", evidenceKinds),
    title: requiredString(value, "title"), excerpt: requiredString(value, "excerpt"), relevance: oneOf(value, "relevance", relevanceValues),
    status: typeof value.status === "string" ? value.status : undefined, author: typeof value.author === "string" ? value.author : undefined,
    timestamp: requiredString(value, "timestamp"), url: typeof value.url === "string" ? value.url : undefined, whyItMatters: requiredString(value, "whyItMatters"),
  };
}

export function parseInvestigationJson(value: unknown): InvestigationResult {
  if (!isRecord(value)) throw new Error("The JSON root must be an object.");
  if (!Array.isArray(value.evidence)) throw new Error('"evidence" must be an array.');
  const evidence = value.evidence.map(parseEvidence);
  const sourceStatus: Record<SourceName, SourceStatus> = { slack: "no_results", jira: "no_results", zendesk: "no_results", confluence: "no_results" };
  if (isRecord(value.sourceStatus)) for (const source of sourceNames) if (source in value.sourceStatus) sourceStatus[source] = oneOf(value.sourceStatus, source, sourceStatuses);
  const sources = Array.isArray(value.sources) ? value.sources.map((item, index) => {
    if (!isRecord(item)) throw new Error(`Source item ${index + 1} must be an object.`);
    return { name: requiredString(item, "name"), status: oneOf(item, "status", sourceStatuses) };
  }) : sourceNames.map((name) => ({ name, status: sourceStatus[name] }));
  return {
    customer: requiredString(value, "customer"), question: requiredString(value, "question"),
    generatedAt: typeof value.generatedAt === "string" ? value.generatedAt : new Date().toISOString(), summary: requiredString(value, "summary"),
    knownFacts: stringArray(value, "knownFacts"), unclearItems: stringArray(value, "unclearItems"), suggestedNextSteps: stringArray(value, "suggestedNextSteps"),
    evidence, sourceStatus, sourceErrors: {}, sources,
  };
}
