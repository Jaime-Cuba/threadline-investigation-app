"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { parseInvestigationJson } from "@threadline/core";

type Evidence = {
  id: string;
  source: "slack" | "jira" | "zendesk" | "confluence";
  kind: string;
  title: string;
  excerpt: string;
  relevance: "high" | "medium" | "low";
  status?: string;
  author?: string;
  timestamp: string;
  url?: string;
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
  sources: [{ name: "Slack", status: "fixture" }, { name: "Jira / Atlassian", status: "fixture" }, { name: "Zendesk", status: "planned" }, { name: "Confluence / Atlassian", status: "fixture" }],
};

const sourceInfo: Record<Evidence["source"], { label: string; short: string }> = {
  slack: { label: "Slack", short: "S" },
  jira: { label: "Jira", short: "J" },
  zendesk: { label: "Zendesk", short: "Z" },
  confluence: { label: "Confluence", short: "C" },
};

function sourceLabel(source: Evidence["source"]) {
  return sourceInfo[source]?.label ?? source;
}

export default function HomePage() {
  const [question, setQuestion] = useState(initialInvestigation.question);
  const [investigation, setInvestigation] = useState(initialInvestigation);
  const [status, setStatus] = useState("Ready for an investigation");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const [importMessage, setImportMessage] = useState("Select a JSON investigation from ChatGPT.");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setIsImported(false);
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

  async function importInvestigation(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = parseInvestigationJson(JSON.parse(await file.text()));
      setInvestigation(imported);
      setIsImported(true);
      setQuestion(imported.question);
      setImportMessage(`Imported ${file.name} · ${imported.evidence.length} evidence items`);
      setStatus("Imported investigation ready");
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "This file could not be imported.");
      setStatus("Import needs attention");
    } finally {
      event.target.value = "";
    }
  }

  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="mark">◌</span><span>threadline</span></div><div className="top-actions"><span className={`pill ${isImported ? "pill-live" : ""}`}>{isImported ? "Imported · ChatGPT brief" : "Demo · synthetic data"}</span><span className="avatar">JC</span></div></header>
    <section className="hero"><div><p className="eyebrow">Investigation continuity copilot</p><h1>See the story behind the issue.</h1><p className="hero-copy">Bring together the customer history that matters, explain it simply, and show what to do next.</p></div><div className="hero-note"><strong>{isImported ? "ChatGPT investigation loaded" : "Read-only prototype"}</strong><span>{isImported ? "The sections below reflect the imported evidence." : "Live Slack and Atlassian connectors are next."}</span></div></section>
    <form className="query" onSubmit={investigate}><input value={question} onChange={(event) => setQuestion(event.target.value)} aria-label="Customer problem" /><button className="primary" type="submit" disabled={isLoading}>{isLoading ? "Investigating…" : "Investigate →"}</button></form>
    <section className="handoff-card" aria-label="Import an investigation from ChatGPT"><div><span className="handoff-label">ChatGPT handoff</span><h2>Already investigated it in ChatGPT?</h2><p>Save ChatGPT's JSON response, then select it here to render the investigation in Threadline.</p><small>{importMessage}</small></div><div><input ref={fileInputRef} className="file-input" type="file" accept="application/json,.json" onChange={importInvestigation} /><button className="secondary-action" type="button" onClick={() => fileInputRef.current?.click()}>Choose JSON file →</button><a className="prompt-link" href="/chatgpt-investigation-prompt.txt" download>Download the ChatGPT prompt</a></div></section>
    <div className="source-strip"><span className="status-dot" />{status}<span className="source-separator">·</span>{investigation.sources.map((source) => <span className="source-chip" key={source.name}>{source.name} · {source.status}</span>)}</div>
    <section className="simple-view">
      <article className="card quick-read"><div className="card-head"><h2>Quick read</h2><span className="tag">Plain-language summary</span></div><p className="quick-read-copy"><strong>In short:</strong> {investigation.summary}</p><div className="plain-points"><div className="plain-point"><b>What we know <span>{investigation.knownFacts.length}</span></b>{investigation.knownFacts[0] ?? "No confirmed facts yet."}</div><div className="plain-point"><b>What is still unclear <span>{investigation.unclearItems.length}</span></b>{investigation.unclearItems[0] ?? "Nothing else is marked unclear."}</div><div className="plain-point"><b>What happens next <span>{investigation.suggestedNextSteps.length}</span></b>{investigation.suggestedNextSteps[0] ?? "No next step has been suggested."}</div></div></article>
      <div className="insight-metrics"><div><span className="metric-number">{investigation.evidence.length}</span><span><b>Evidence records</b><small>Relevant history found</small></span></div><div><span className="metric-number">{investigation.evidence.filter((item) => item.relevance === "high").length}</span><span><b>High-confidence signals</b><small>Strongest support</small></span></div><div><span className="metric-number">{new Set(investigation.evidence.map((item) => item.source)).size}</span><span><b>Sources represented</b><small>Cross-system context</small></span></div></div>
      <article className="card next-step"><div className="card-head"><h2>Suggested next steps</h2><span className="tag">Start here</span></div><ol>{investigation.suggestedNextSteps.map((step) => <li key={step}>{step}</li>)}</ol><button className="secondary-action" onClick={copyPlan} type="button">{copied ? "Copied ✓" : "Copy this plan →"}</button><span className="ready">{copied ? "Ready to share" : "Simple enough to share"}</span></article>
      <details className="detail-section"><summary><span><b>Related history</b><small>Older tickets, discussions, and custom work that may help explain the issue</small></span><strong>Explore history <span>+</span></strong></summary><div className="detail-body"><div className="history-grid">{investigation.evidence.map((item) => <HistoryCard key={item.id} evidence={item} />)}</div></div></details>
      <details className="detail-section"><summary><span><b>Technical details</b><small>Source records, timeline, and the reasoning behind the summary</small></span><strong>Show details <span>+</span></strong></summary><div className="detail-body technical-body"><div className="technical-summary"><b>Evidence map:</b> {investigation.evidence.length} records across {new Set(investigation.evidence.map((item) => item.source)).size} sources. High-confidence items are shown first in the history below.</div>{investigation.evidence.map((item) => <div className="evidence-row" key={item.id}><div className={`source-icon source-${item.source}`}>{sourceInfo[item.source].short}</div><div><h3>{item.title}</h3><p>{sourceLabel(item.source)} · {item.timestamp}{item.status ? ` · ${item.status}` : ""}{item.author ? ` · ${item.author}` : ""}</p><div className="quote">{item.excerpt}</div><p className="evidence-why"><b>Why it matters:</b> {item.whyItMatters}</p>{item.url ? <a className="evidence-link" href={item.url} target="_blank" rel="noreferrer">Open source record ↗</a> : null}</div><time>{item.relevance}</time></div>)}</div></details>
    </section>
    <footer className="footer"><span>● {isImported ? "Imported evidence · Read-only" : "Synthetic evidence only"}</span><span>Threadline prototype · Read-only · Connector-ready</span></footer>
  </main>;
}

function HistoryCard({ evidence }: { evidence: Evidence }) {
  const type = evidence.kind === "custom_work" ? "Custom work" : evidence.kind === "discussion" ? "Slack discussion" : "Past ticket";
  return <div className="history-item"><div className="history-meta"><span className="history-type"><span className={`history-source source-${evidence.source}`}>{sourceInfo[evidence.source].short}</span>{sourceLabel(evidence.source)} · {type}</span><span className={`history-state${evidence.relevance === "medium" ? " caution" : ""}`}>{evidence.status ?? evidence.relevance}</span></div><h3>{evidence.title}</h3><p>{evidence.excerpt}</p><div className="history-relevance"><strong>Why it matters:</strong> {evidence.whyItMatters}</div>{evidence.url ? <a className="evidence-link" href={evidence.url} target="_blank" rel="noreferrer">Open source record ↗</a> : null}</div>;
}
