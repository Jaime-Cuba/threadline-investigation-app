"use client";

import { FormEvent, useState } from "react";

type Evidence = {
  id: string;
  source: "slack" | "jira" | "confluence";
  kind: string;
  title: string;
  excerpt: string;
  relevance: "high" | "medium" | "low";
  status?: string;
  author?: string;
  timestamp: string;
  whyItMatters: string;
};

type Investigation = {
  customer: string;
  question: string;
  summary: string;
  knownFacts: string[];
  unclearItems: string[];
  suggestedNextSteps: string[];
  evidence: Evidence[];
  sources: Array<{ name: string; status: "fixture" | "planned" | "no_results" | "error" }>;
};

const initialInvestigation: Investigation = {
  customer: "Jellycat",
  question: "Why is Jellycat seeing duplicate profiles and Bloomreach delivery failures?",
  summary: "Jellycat may have two related issues happening at the same time. One is about matching customer profiles. The other is about Bloomreach messages not reaching Attentive.",
  knownFacts: [
    "Teams observed IDs linking, followed by an email subscription and repeat welcome series.",
    "The postback is returning HTTP 405 while the customer is waiting on a fresh failure example.",
  ],
  unclearItems: [
    "It is not confirmed whether the old profile-matching workaround is still active.",
    "The historic fix is not proof that the current customer configuration is resolved.",
  ],
  suggestedNextSteps: ["Confirm whether the old profile-matching workaround is still active.", "Collect one recent example of the failed Bloomreach postback.", "Keep the profile issue and delivery issue separate while investigating."],
  evidence: [
    { id: "jira-ie-895", source: "jira", kind: "ticket", title: "IE-895 · US Bloomreach postback returns 405", excerpt: "The postback is returning HTTP 405 while the customer is waiting on a fresh failure example.", relevance: "high", status: "Waiting for Customer", timestamp: "2026-10-22", whyItMatters: "Shows a separate delivery issue that should not be conflated with profile matching." },
    { id: "slack-identity-workaround", source: "slack", kind: "discussion", title: "Identity mapping workaround discussed", excerpt: "Teams observed IDs linking, followed by an email subscription and repeat welcome series.", relevance: "high", status: "Strong signal", author: "Synthetic support thread", timestamp: "2026-10-02", whyItMatters: "May explain the duplicate welcome behavior and the consent risk." },
    { id: "custom-prior-identity", source: "confluence", kind: "custom_work", title: "Prior identity-linking script", excerpt: "A similar integration used custom logic to connect an email identity to an SMS profile.", relevance: "medium", status: "Applicability unclear", timestamp: "2026-02-18", whyItMatters: "Provides implementation precedent, but does not confirm that the same approach is active today." },
    { id: "jira-ie-762", source: "jira", kind: "ticket", title: "IE-762 · Previous integration fix", excerpt: "An older case closed after a configuration change, but the underlying method and current state are unclear.", relevance: "medium", status: "Closed", timestamp: "2026-03-14", whyItMatters: "Useful as a lead to investigate, not proof that today’s issue is fixed." },
  ],
  sources: [{ name: "Slack", status: "fixture" }, { name: "Jira / Atlassian", status: "fixture" }, { name: "Confluence / Atlassian", status: "fixture" }],
};

export default function HomePage() {
  const [question, setQuestion] = useState(initialInvestigation.question);
  const [investigation, setInvestigation] = useState(initialInvestigation);
  const [status, setStatus] = useState("Ready for an investigation");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function investigate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus("Searching synthetic Slack and Atlassian history…");

    try {
      const response = await fetch("/api/investigate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customer: "Jellycat", question }),
      });
      if (!response.ok) throw new Error("Investigation request failed");
      setInvestigation(await response.json());
      setStatus("Investigation ready");
    } catch {
      setStatus("We could not refresh the investigation. Showing the last available result.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyPlan() {
    await navigator.clipboard?.writeText(investigation.suggestedNextSteps.map((step, index) => `${index + 1}. ${step}`).join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="mark">◌</span><span>threadline</span></div><div className="top-actions"><span className="pill">Demo · synthetic data</span><span className="avatar">JC</span></div></header>
    <section className="hero"><div><p className="eyebrow">Investigation continuity copilot</p><h1>See the story behind the issue.</h1><p className="hero-copy">Bring together the customer history that matters, explain it simply, and show what to do next.</p></div><div className="hero-note"><strong>Read-only prototype</strong><span>Live Slack and Atlassian connectors are next.</span></div></section>
    <form className="query" onSubmit={investigate}><input value={question} onChange={(event) => setQuestion(event.target.value)} aria-label="Customer problem" /><button className="primary" type="submit" disabled={isLoading}>{isLoading ? "Investigating…" : "Investigate →"}</button></form>
    <div className="source-strip"><span className="status-dot" />{status}<span className="source-separator">·</span>{investigation.sources.map((source) => <span className="source-chip" key={source.name}>{source.name} · {source.status}</span>)}</div>
    <section className="simple-view">
      <article className="card quick-read"><div className="card-head"><h2>Quick read</h2><span className="tag">Plain-language summary</span></div><p className="quick-read-copy"><strong>In short:</strong> {investigation.summary}</p><div className="plain-points"><div className="plain-point"><b>What we know</b>{investigation.knownFacts[0] ?? "No confirmed facts yet."}</div><div className="plain-point"><b>What is still unclear</b>{investigation.unclearItems[0] ?? "Nothing else is marked unclear."}</div><div className="plain-point"><b>What happens next</b>{investigation.suggestedNextSteps[0]}</div></div></article>
      <article className="card next-step"><div className="card-head"><h2>Suggested next steps</h2><span className="tag">Start here</span></div><ol>{investigation.suggestedNextSteps.map((step) => <li key={step}>{step}</li>)}</ol><button className="secondary-action" onClick={copyPlan} type="button">{copied ? "Copied ✓" : "Copy this plan →"}</button><span className="ready">{copied ? "Ready to share" : "Simple enough to share"}</span></article>
      <details className="detail-section"><summary><span><b>Related history</b><small>Older tickets, discussions, and custom work that may help explain the issue</small></span><strong>Explore history <span>+</span></strong></summary><div className="detail-body"><div className="history-grid">{investigation.evidence.map((item) => <HistoryCard key={item.id} evidence={item} />)}</div></div></details>
      <details className="detail-section"><summary><span><b>Technical details</b><small>Source records, timeline, and the reasoning behind the summary</small></span><strong>Show details <span>+</span></strong></summary><div className="detail-body technical-body"><div className="technical-summary"><b>Current technical picture:</b> identity linking may be creating consent risk, while a Bloomreach postback is returning HTTP 405.</div>{investigation.evidence.map((item) => <div className="evidence-row" key={item.id}><div className="source-icon">{item.source === "slack" ? "S" : "J"}</div><div><h3>{item.title}</h3><p>{item.source.toUpperCase()} · {item.timestamp}{item.status ? ` · ${item.status}` : ""}</p><div className="quote">{item.excerpt}</div><p className="evidence-why"><b>Why it matters:</b> {item.whyItMatters}</p></div><time>{item.relevance}</time></div>)}</div></details>
    </section>
    <footer className="footer"><span>● Synthetic evidence only</span><span>Threadline prototype · Read-only · Connector-ready</span></footer>
  </main>;
}

function HistoryCard({ evidence }: { evidence: Evidence }) {
  const type = evidence.kind === "custom_work" ? "Custom work" : evidence.kind === "discussion" ? "Slack discussion" : "Past ticket";
  return <div className="history-item"><div className="history-meta"><span className="history-type">{type}</span><span className={`history-state${evidence.relevance === "medium" ? " caution" : ""}`}>{evidence.status ?? evidence.relevance}</span></div><h3>{evidence.title}</h3><p>{evidence.excerpt}</p><div className="history-relevance"><strong>Why it matters:</strong> {evidence.whyItMatters}</div></div>;
}
