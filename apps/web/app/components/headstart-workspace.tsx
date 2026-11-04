"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { parseInvestigationJson } from "@threadline/core";

type EvidenceSource = "slack" | "jira" | "zendesk" | "confluence";
type AudienceRole = "executive" | "csm" | "technical";
type Evidence = {
  id: string;
  source: EvidenceSource;
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

const sourceInfo: Record<EvidenceSource, { label: string; short: string; tone: string }> = {
  slack: { label: "Slack", short: "S", tone: "slack" },
  jira: { label: "Jira", short: "J", tone: "jira" },
  zendesk: { label: "Zendesk", short: "Z", tone: "zendesk" },
  confluence: { label: "Wiki / Confluence", short: "W", tone: "confluence" },
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
  suggestedNextSteps: [
    "Confirm whether the old profile-matching workaround is still active.",
    "Collect one recent example of the failed Bloomreach postback.",
    "Keep the profile issue and delivery issue separate while investigating.",
  ],
  evidence: [
    { id: "jira-ie-895", source: "jira", kind: "ticket", title: "IE-895 · US Bloomreach postback returns 405", excerpt: "The postback is returning HTTP 405 while the customer is waiting on a fresh failure example.", relevance: "high", status: "Waiting for Customer", timestamp: "2026-10-22", whyItMatters: "Shows a separate delivery issue that should not be conflated with profile matching." },
    { id: "slack-identity-workaround", source: "slack", kind: "discussion", title: "Identity mapping workaround discussed", excerpt: "Teams observed IDs linking, followed by an email subscription and repeat welcome series.", relevance: "high", status: "Strong signal", author: "Synthetic support thread", timestamp: "2026-10-02", whyItMatters: "May explain the duplicate welcome behavior and the consent risk." },
    { id: "custom-prior-identity", source: "confluence", kind: "custom_work", title: "Prior identity-linking script", excerpt: "A similar integration used custom logic to connect an email identity to an SMS profile.", relevance: "medium", status: "Applicability unclear", timestamp: "2026-02-18", whyItMatters: "Provides implementation precedent, but does not confirm that the same approach is active today." },
    { id: "jira-ie-762", source: "jira", kind: "ticket", title: "IE-762 · Previous integration fix", excerpt: "An older case closed after a configuration change, but the underlying method and current state are unclear.", relevance: "medium", status: "Closed", timestamp: "2026-03-14", whyItMatters: "Useful as a lead to investigate, not proof that today’s issue is fixed." },
  ],
  sources: [
    { name: "Slack", status: "fixture" },
    { name: "Jira / Atlassian", status: "fixture" },
    { name: "Zendesk", status: "planned" },
    { name: "Confluence / Atlassian", status: "fixture" },
  ],
};

function sourceLabel(source: EvidenceSource) {
  return sourceInfo[source]?.label ?? source;
}

function evidenceType(kind: string) {
  if (kind === "custom_work") return "Custom work";
  if (kind === "discussion") return "Discussion";
  if (kind === "documentation") return "Documentation";
  return "Ticket";
}

export default function HeadstartWorkspace() {
  const [question, setQuestion] = useState(initialInvestigation.question);
  const [investigation, setInvestigation] = useState(initialInvestigation);
  const [status, setStatus] = useState("Ready to investigate");
  const [isLoading, setIsLoading] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audienceRole, setAudienceRole] = useState<AudienceRole>("csm");
  const [importMessage, setImportMessage] = useState("Import a ChatGPT brief to begin.");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const highConfidence = investigation.evidence.filter((item) => item.relevance === "high").length;
  const representedSources = new Set(investigation.evidence.map((item) => item.source)).size;
  const audienceSummary = audienceRole === "executive"
    ? `The record points to a recurring integration issue with a previous workaround, but there is not enough evidence to call the current customer impact resolved.`
    : audienceRole === "technical"
      ? `The technical history connects ${investigation.evidence.length} records across the investigation window. Review the chronology below to separate diagnosis, decisions, workarounds, and recurrence.`
      : investigation.summary;

  async function investigate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatus("Searching available investigation sources…");
    try {
      const response = await fetch("/api/investigate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customer: investigation.customer, question }),
      });
      if (!response.ok) throw new Error("Investigation request failed");
      setInvestigation(await response.json());
      setIsImported(false);
      setStatus("Investigation ready");
    } catch {
      setStatus("Unable to refresh; showing the last available brief");
    } finally {
      setIsLoading(false);
    }
  }

  async function importInvestigation(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = parseInvestigationJson(JSON.parse(await file.text()));
      setInvestigation(imported);
      setQuestion(imported.question);
      setIsImported(true);
      setImportMessage(`${file.name} · ${imported.evidence.length} evidence records loaded`);
      setStatus("Imported brief ready");
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "This file could not be imported.");
      setStatus("Import needs attention");
    } finally {
      event.target.value = "";
    }
  }

  async function copyPlan() {
    await navigator.clipboard?.writeText(investigation.suggestedNextSteps.map((step, index) => `${index + 1}. ${step}`).join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <main className="headstart-shell">
      <header className="headstart-header">
        <div className="headstart-brand"><span className="headstart-mark">↗</span><span>headstart</span></div>
        <div className="headstart-header-actions"><span className={`headstart-mode ${isImported ? "is-imported" : ""}`}>{isImported ? "ChatGPT brief loaded" : "Read-only workspace"}</span><span className="headstart-avatar">JC</span></div>
      </header>

      <section className="headstart-intro">
        <div>
          <p className="headstart-eyebrow">Investigation continuity workspace</p>
          <h1>Start with the story, not the search.</h1>
          <p>Headstart gives every investigator a clear view of what happened, what still needs proof, and where to look next.</p>
        </div>
        <div className="headstart-account"><span>ACCOUNT</span><strong>{investigation.customer}</strong><small>{status}</small></div>
      </section>

      <section className="headstart-command">
        <div className="headstart-command-copy"><span className="headstart-command-icon">⌕</span><div><b>What do you need to understand?</b><small>Ask a customer or technical question in plain language.</small></div></div>
        <form onSubmit={investigate}><input value={question} onChange={(event) => setQuestion(event.target.value)} aria-label="Investigation question" /><button type="submit" disabled={isLoading}>{isLoading ? "Working…" : "Investigate"}<span>→</span></button></form>
      </section>

      <section className="headstart-handoff"><div><span className="headstart-handoff-label">Optional ChatGPT handoff</span><b>Already investigated this in ChatGPT?</b><small>{importMessage}</small></div><input ref={fileInputRef} className="file-input" type="file" accept="application/json,.json" onChange={importInvestigation} /><button className="headstart-text-button" type="button" onClick={() => fileInputRef.current?.click()}>Choose JSON file <span>↗</span></button><a className="headstart-prompt-link" href="/chatgpt-investigation-prompt.txt" download>Download prompt</a></section>

      <AudienceTabs role={audienceRole} setRole={setAudienceRole} />

      <section className="headstart-layout">
        <div className="headstart-main-column">
          <article className="headstart-summary-card"><div className="headstart-section-kicker"><span>01</span><span>{audienceRole.toUpperCase()} ORIENTATION</span><span className="headstart-confidence">{highConfidence} strong signals</span></div><h2>{audienceSummary}</h2><div className="headstart-summary-footer"><span>For {investigation.customer}</span><span>·</span><span>{investigation.evidence.length} records reviewed</span></div></article>

          {audienceRole === "technical" ? <TechnicalTimeline investigation={investigation} /> : null}

          {audienceRole !== "technical" ? <><div className="headstart-section-heading"><div><span className="headstart-section-kicker plain">02 · INVESTIGATION SIGNALS</span><h2>The shape of the story</h2></div><span className="headstart-count">{investigation.knownFacts.length + investigation.unclearItems.length} observations</span></div>
          <div className="headstart-signal-grid"><article><div className="headstart-signal-title"><span className="signal-dot confirmed" />Confirmed</div><ul>{investigation.knownFacts.map((fact) => <li key={fact}>{fact}</li>)}</ul></article><article><div className="headstart-signal-title"><span className="signal-dot uncertain" />Still unclear</div><ul>{investigation.unclearItems.map((item) => <li key={item}>{item}</li>)}</ul></article></div></> : null}

          {audienceRole !== "technical" ? <><div className="headstart-section-heading"><div><span className="headstart-section-kicker plain">03 · SOURCE HISTORY</span><h2>What the record shows</h2></div><span className="headstart-count">{representedSources} sources</span></div>
          <div className="headstart-evidence-list">{investigation.evidence.map((item, index) => <EvidenceRow key={item.id} evidence={item} index={index} />)}</div></> : null}
        </div>

        <aside className="headstart-side-column">
          <article className="headstart-panel next-panel"><div className="headstart-panel-heading"><span className="headstart-section-kicker plain">NEXT BEST MOVES</span><span className="headstart-arrow">↗</span></div><ol>{investigation.suggestedNextSteps.map((step) => <li key={step}>{step}</li>)}</ol><button className="headstart-outline-button" type="button" onClick={copyPlan}>{copied ? "Plan copied ✓" : "Copy investigation plan"}</button></article>
          <article className="headstart-panel"><div className="headstart-panel-heading"><span className="headstart-section-kicker plain">SOURCE COVERAGE</span><span className="headstart-count">{investigation.sources.length}</span></div><div className="headstart-source-list">{investigation.sources.map((source) => <div key={source.name}><span className={`source-badge source-${source.name.toLowerCase().includes("slack") ? "slack" : source.name.toLowerCase().includes("jira") ? "jira" : source.name.toLowerCase().includes("zendesk") ? "zendesk" : "confluence"}`}>{source.name.charAt(0)}</span><span>{source.name}</span><small className={`source-status status-${source.status}`}>{source.status.replace("_", " ")}</small></div>)}</div></article>
          <article className="headstart-panel trust-panel"><div className="trust-icon">✓</div><div><b>Read-only by design</b><p>Headstart explains the record. It does not change source systems.</p></div></article>
        </aside>
      </section>

      <footer className="headstart-footer"><span>HEADSTART · INVESTIGATION CONTINUITY</span><span>{isImported ? "Imported brief · verify before sharing" : "Synthetic evidence · connector-ready"}</span></footer>
    </main>
  );
}

function EvidenceRow({ evidence, index }: { evidence: Evidence; index: number }) {
  return <article className="headstart-evidence-row"><div className="headstart-evidence-index">{String(index + 1).padStart(2, "0")}</div><div className={`headstart-evidence-source source-${sourceInfo[evidence.source].tone}`}>{sourceInfo[evidence.source].short}</div><div className="headstart-evidence-content"><div className="headstart-evidence-meta"><span>{sourceLabel(evidence.source)} · {evidenceType(evidence.kind)}</span><span className={`headstart-relevance relevance-${evidence.relevance}`}>{evidence.relevance} relevance</span></div><h3>{evidence.title}</h3><p>{evidence.excerpt}</p><div className="headstart-why"><b>Why it matters</b><span>{evidence.whyItMatters}</span></div>{evidence.url ? <a href={evidence.url} target="_blank" rel="noreferrer">Open source record ↗</a> : null}</div><time>{evidence.timestamp}</time></article>;
}

function AudienceTabs({ role, setRole }: { role: AudienceRole; setRole: (role: AudienceRole) => void }) {
  return <nav className="headstart-audience-tabs" aria-label="Investigation audience view"><div><span className="headstart-section-kicker plain">VIEW AS</span><strong>Choose the level of detail</strong></div><div className="headstart-audience-buttons" role="tablist">{(["executive", "csm", "technical"] as AudienceRole[]).map((item) => <button key={item} className={role === item ? "is-active" : ""} onClick={() => setRole(item)} role="tab" aria-selected={role === item} type="button">{item === "csm" ? "CSM" : item.charAt(0).toUpperCase() + item.slice(1)}{item === "technical" ? <span>Timeline</span> : null}</button>)}</div></nav>;
}

function TechnicalTimeline({ investigation }: { investigation: Investigation }) {
  const events = [...investigation.evidence].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  const hasSource = (source: EvidenceSource) => events.some((item) => item.source === source);
  return <section className="headstart-technical-timeline"><div className="headstart-section-heading"><div><span className="headstart-section-kicker plain">02 · TECHNICAL HISTORY</span><h2>Chronological evidence</h2></div><span className="headstart-count">{events.length} records · oldest first</span></div><div className="headstart-technical-coverage">{(["jira", "slack", "zendesk", "confluence"] as EvidenceSource[]).map((source) => <span key={source} className={hasSource(source) ? "has-records" : "no-records"}><i className={`source-badge source-${sourceInfo[source].tone}`}>{sourceInfo[source].short}</i>{sourceInfo[source].label}{hasSource(source) ? " · found" : " · no records"}</span>)}</div><div className="headstart-timeline">{events.map((event) => <article className="headstart-timeline-event" key={event.id}><time>{event.timestamp}</time><div className={`headstart-timeline-node source-${sourceInfo[event.source].tone}`} /> <div className="headstart-timeline-card"><div className="headstart-timeline-meta"><span>{sourceLabel(event.source)} · {evidenceType(event.kind)}</span><span className={`headstart-relevance relevance-${event.relevance}`}>{event.status ?? `${event.relevance} relevance`}</span></div><h3>{event.title}</h3><p>{event.excerpt}</p><div className="headstart-why"><b>Why it matters</b><span>{event.whyItMatters}</span></div>{event.url ? <a href={event.url} target="_blank" rel="noreferrer">Open ticket or source ↗</a> : <span className="headstart-no-link">Source link unavailable in this brief</span>}</div></article>)}</div></section>;
}
