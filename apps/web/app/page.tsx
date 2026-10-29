"use client";

import { FormEvent, useState } from "react";

type Investigation = { customer: string; question: string; summary: string; suggestedNextSteps: string[]; sources: Array<{ name: string; status: "fixture" | "planned" }> };

const initialInvestigation: Investigation = {
  customer: "Jellycat",
  question: "Why is Jellycat seeing duplicate profiles and Bloomreach delivery failures?",
  summary: "Jellycat may have two related issues happening at the same time. One is about matching customer profiles. The other is about Bloomreach messages not reaching Attentive.",
  suggestedNextSteps: ["Confirm whether the old profile-matching workaround is still active.", "Ask for one recent example of the failed Bloomreach message.", "Keep the profile issue and delivery issue separate while investigating."],
  sources: [{ name: "Synthetic Jellycat fixture", status: "fixture" }, { name: "Slack", status: "planned" }, { name: "Jira / Atlassian", status: "planned" }],
};

export default function HomePage() {
  const [question, setQuestion] = useState(initialInvestigation.question);
  const [investigation, setInvestigation] = useState(initialInvestigation);
  const [status, setStatus] = useState("Ready for an investigation");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function investigate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setIsLoading(true); setStatus("Building a clear investigation brief…");
    try {
      const response = await fetch("/api/investigate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ customer: "Jellycat", question }) });
      if (!response.ok) throw new Error("Investigation request failed");
      setInvestigation(await response.json()); setStatus("Investigation ready");
    } catch { setStatus("We could not refresh the investigation. Showing the last available result."); }
    finally { setIsLoading(false); }
  }

  async function copyPlan() {
    await navigator.clipboard?.writeText(investigation.suggestedNextSteps.map((step, index) => `${index + 1}. ${step}`).join("\n"));
    setCopied(true); window.setTimeout(() => setCopied(false), 2200);
  }

  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="mark">◌</span><span>threadline</span></div><div className="top-actions"><span className="pill">Public demo · synthetic data</span><span className="avatar">JC</span></div></header>
    <section className="hero"><div><p className="eyebrow">Investigation continuity copilot</p><h1>See the story behind the issue.</h1><p className="hero-copy">Bring together the customer history that matters, explain it simply, and show what to do next.</p></div><div className="hero-note"><strong>Read-only prototype</strong><span>No live customer systems are connected.</span></div></section>
    <form className="query" onSubmit={investigate}><input value={question} onChange={(event) => setQuestion(event.target.value)} aria-label="Customer problem" /><button className="primary" type="submit" disabled={isLoading}>{isLoading ? "Investigating…" : "Investigate →"}</button></form>
    <div className="source-strip"><span className="status-dot" />{status}<span className="source-separator">·</span>{investigation.sources.map((source) => <span className="source-chip" key={source.name}>{source.name}{source.status === "planned" ? " · planned" : ""}</span>)}</div>
    <section className="simple-view">
      <article className="card quick-read"><div className="card-head"><h2>Quick read</h2><span className="tag">Plain-language summary</span></div><p className="quick-read-copy"><strong>In short:</strong> {investigation.summary}</p><div className="plain-points"><div className="plain-point"><b>What we know</b>Some customer profiles may be linking, but the process can also send the same welcome email again.</div><div className="plain-point"><b>What is still unclear</b>We do not yet know if the old workaround is still being used or if it works for this UK setup.</div><div className="plain-point"><b>What happens next</b>Confirm the current setup, then get a fresh example of the failed postback.</div></div></article>
      <article className="card next-step"><div className="card-head"><h2>Suggested next steps</h2><span className="tag">Start here</span></div><ol>{investigation.suggestedNextSteps.map((step) => <li key={step}>{step}</li>)}</ol><button className="secondary-action" onClick={copyPlan} type="button">{copied ? "Copied ✓" : "Copy this plan →"}</button><span className="ready">{copied ? "Ready to share" : "Simple enough to share"}</span></article>
      <details className="detail-section"><summary><span><b>Related history</b><small>Older tickets, discussions, and custom work that may help explain the issue</small></span><strong>Explore history <span>+</span></strong></summary><div className="detail-body"><div className="history-grid"><HistoryCard type="Custom work" state="Applicability unclear" title="Prior identity-linking script" text="A similar integration used custom logic to connect an email identity to an SMS profile." relevance="Possible implementation precedent, but UK / Two-Tap behavior was not confirmed." /><HistoryCard type="Slack discussion" state="Strong signal" title="Known-email workaround" text="Teams observed IDs linking, followed by an email subscription and repeat welcome series." relevance="Explains the consent risk and suggests the workaround may be causing the journey side effect." /><HistoryCard type="Past ticket" state="Not resolution" title="Previous integration fix" text="An older case closed after a configuration change, but the underlying method and current state are unclear." relevance="Useful as a lead to investigate, not proof that today’s issue is fixed." caution /></div></div></details>
      <details className="detail-section"><summary><span><b>Technical details</b><small>Source records, timeline, and the reasoning behind the summary</small></span><strong>Show details <span>+</span></strong></summary><div className="detail-body technical-body"><div className="technical-summary"><b>Current technical picture:</b> identity linking may be creating consent risk, while a US Bloomreach postback is returning HTTP 405.</div><div className="evidence-row"><div className="source-icon">J</div><div><h3>IE-895 · US Bloomreach postback returns 405</h3><p>Jira · Waiting for Customer · Oct 22, 2026</p></div><time>open</time></div><div className="evidence-row"><div className="source-icon">S</div><div><h3>Identity mapping workaround discussed</h3><p>Slack · #jellycat-uk_launch · Oct 2, 2026</p><div className="quote">“It looked like the IDs linked, but it also subscribed the email and sent the welcome series again.”</div></div><time>signal</time></div><div className="mini-timeline"><span><b>FEB</b> Prior identity precedent</span><span><b>OCT 02</b> Workaround proposed</span><span><b>OCT 19</b> Customer impact</span><span><b>OCT 22</b> Postback investigation</span></div></div></details>
    </section>
    <footer className="footer"><span>● Synthetic evidence only</span><span>Threadline prototype · No live connectors · Read-only</span></footer>
  </main>;
}

function HistoryCard({ type, state, title, text, relevance, caution = false }: { type: string; state: string; title: string; text: string; relevance: string; caution?: boolean }) {
  return <div className="history-item"><div className="history-meta"><span className="history-type">{type}</span><span className={`history-state${caution ? " caution" : ""}`}>{state}</span></div><h3>{title}</h3><p>{text}</p><div className="history-relevance"><strong>Why it matters:</strong> {relevance}</div></div>;
}
