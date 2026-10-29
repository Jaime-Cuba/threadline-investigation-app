export type SourceName = "slack" | "jira" | "confluence";

export type SourceStatus = "fixture" | "planned" | "no_results" | "error";

export type EvidenceKind = "discussion" | "ticket" | "documentation" | "custom_work";

export type Evidence = {
  id: string;
  source: SourceName;
  kind: EvidenceKind;
  title: string;
  excerpt: string;
  relevance: "high" | "medium" | "low";
  status?: string;
  author?: string;
  timestamp: string;
  url?: string;
  whyItMatters: string;
};

export type InvestigationInput = {
  customer: string;
  question: string;
};

export type InvestigationOptions = {
  sourceNames?: SourceName[];
};

export type InvestigationSource = {
  name: SourceName;
  displayName: string;
  status: SourceStatus;
  search: (input: InvestigationInput) => Promise<Evidence[]>;
};

export type InvestigationResult = InvestigationInput & {
  generatedAt: string;
  summary: string;
  knownFacts: string[];
  unclearItems: string[];
  suggestedNextSteps: string[];
  evidence: Evidence[];
  sourceStatus: Record<SourceName, SourceStatus>;
  sourceErrors: Partial<Record<SourceName, string>>;
  sources: Array<{ name: string; status: SourceStatus }>;
};
