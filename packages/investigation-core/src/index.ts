export type InvestigationInput = { customer: string; question: string };

export type InvestigationResult = {
  customer: string;
  question: string;
  summary: string;
  suggestedNextSteps: string[];
  sources: Array<{ name: string; status: "fixture" | "planned" }>;
};

export function investigate(input: InvestigationInput): InvestigationResult {
  return {
    ...input,
    summary: "Jellycat may have two related issues: profile matching can trigger duplicate welcome behavior, while a Bloomreach postback may be failing separately.",
    suggestedNextSteps: [
      "Confirm whether the profile-matching workaround is still active.",
      "Collect one recent example of the failed postback.",
      "Keep identity and delivery issues separate during investigation.",
    ],
    sources: [
      { name: "Synthetic Jellycat fixture", status: "fixture" },
      { name: "Slack", status: "planned" },
      { name: "Jira / Atlassian", status: "planned" },
    ],
  };
}
