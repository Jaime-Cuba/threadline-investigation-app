import { jellycatEvidence } from "./fixtures";
import { Evidence, InvestigationInput, InvestigationSource } from "./types";

function matchesQuery(evidence: Evidence, input: InvestigationInput) {
  const query = `${input.customer} ${input.question}`.toLowerCase();
  const terms = `${evidence.title} ${evidence.excerpt}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  return terms.some((term) => term.length > 3 && query.includes(term));
}

function matchesFixture(evidence: Evidence, input: InvestigationInput) {
  return input.customer.toLowerCase().includes("jellycat") || matchesQuery(evidence, input);
}

export const fixtureSlackSource: InvestigationSource = {
  name: "slack",
  displayName: "Slack",
  status: "fixture",
  async search(input) {
    return jellycatEvidence.filter((evidence) => evidence.source === "slack" && matchesFixture(evidence, input));
  },
};

export const fixtureJiraSource: InvestigationSource = {
  name: "jira",
  displayName: "Jira / Atlassian",
  status: "fixture",
  async search(input) {
    return jellycatEvidence.filter((evidence) => evidence.source === "jira" && matchesFixture(evidence, input));
  },
};

export const fixtureConfluenceSource: InvestigationSource = {
  name: "confluence",
  displayName: "Confluence / Atlassian",
  status: "fixture",
  async search(input) {
    return jellycatEvidence.filter((evidence) => evidence.source === "confluence" && matchesFixture(evidence, input));
  },
};
