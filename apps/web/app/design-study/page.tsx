"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import styles from "./design-study.module.css";

type AppView = "cases" | "search" | "settings";
type Role = "executive" | "csm" | "technical";
type Source = "Slack" | "Jira" | "Zendesk" | "Wiki";
type EventType = "Diagnosis" | "Decision" | "Recurrence" | "Workaround" | "Validation";

type TimelineEvent = {
  id: string;
  date: string;
  source: Source;
  title: string;
  detail: string;
  type: EventType;
  status: string;
  link: string;
};

const events: TimelineEvent[] = [
  { id: "zd-4821", date: "May 14, 2026", source: "Zendesk", title: "Creative rendering issue first reported", detail: "VistaPrint reported that selected campaign creatives were not rendering as expected for a subset of journeys.", type: "Diagnosis", status: "Strong signal", link: "Zendesk #4821" },
  { id: "cat-284", date: "Jun 3, 2026", source: "Jira", title: "Identity-side mapping change marked complete", detail: "CAT-284 recorded a mapping change on the Attentive side, but the record does not confirm customer-facing retesting.", type: "Decision", status: "Closed", link: "CAT-284" },
  { id: "slack-1028", date: "Sep 18, 2026", source: "Slack", title: "Creative issue reported again", detail: "The team questioned whether the same rendering pattern was recurring after a VistaPrint-side creative update.", type: "Recurrence", status: "Unresolved", link: "#customer-escalations" },
  { id: "cat-291", date: "Oct 2, 2026", source: "Jira", title: "Temporary journey workaround applied", detail: "CAT-291 documented a temporary suppression while the source creative and identity mapping were compared.", type: "Workaround", status: "Temporary", link: "CAT-291" },
  { id: "wiki-1102", date: "Nov 2, 2026", source: "Wiki", title: "Creative integration runbook reviewed", detail: "The runbook describes the expected creative flow, but does not document VistaPrint’s current mapping or validation result.", type: "Validation", status: "Gap remains", link: "Creative integration runbook" },
];

const cases = [
  { id: "vistaprint", name: "VistaPrint · creative rendering issue", status: "Investigation in progress", updated: "2m ago", summary: "The issue has appeared across several records, but the latest resolution is not verified." },
  { id: "bloombreach", name: "Bloombreach · postback failure", status: "Needs customer input", updated: "Yesterday", summary: "A fresh failure example is needed to compare the current request." },
  { id: "aurora", name: "Aurora Outfitters · catalog sync", status: "Ready to share", updated: "3 days ago", summary: "Catalog synchronization history is complete enough for a handoff." },
];

const roleCopy: Record<Role, { label: string; title: string; summary: string; action: string; bullets: string[] }> = {
  executive: { label: "Executive view", title: "VistaPrint’s creative issue may still be unresolved", summary: "The issue has appeared in records across roughly six months. A change was completed and a workaround was applied, but current customer impact and final resolution are not verified.", action: "Confirm owner and customer update", bullets: ["Impact: possible continued creative rendering issue", "Confidence: medium, based on 14 records", "Decision required: current-state validation"] },
  csm: { label: "CSM view", title: "VistaPrint has a history of creative issues, but the latest outcome is unclear", summary: "The issue was first reported in May, revisited in September, and followed by an identity-side change and a temporary workaround. We should confirm what VistaPrint is seeing now before describing it as fixed.", action: "Prepare customer-safe update", bullets: ["Safe to say: related history exists across several records", "Avoid saying: the identity change resolved the issue", "Ask for: one current creative, journey, and expected result"] },
  technical: { label: "Technical view", title: "Creative rendering history spans the VistaPrint side and the identity side", summary: "Across Zendesk, Jira, Slack, and Wiki documentation, the record shows an initial creative issue, an Attentive-side identity mapping change, a later recurrence after a VistaPrint-side creative update, and a temporary workaround. The current resolution is not verified.", action: "Review unresolved evidence", bullets: ["5 relevant records across 4 source types", "1 recurrence after a recorded workaround", "1 validation gap remains"] },
};

const sourceTone: Record<Source, string> = { Slack: "slack", Jira: "jira", Zendesk: "zendesk", Wiki: "confluence" };

export default function DesignStudyPage() {
  const [view, setView] = useState<AppView>("cases");
  const [role, setRole] = useState<Role>("csm");
  const [selectedCase, setSelectedCase] = useState(cases[0]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [showNewCase, setShowNewCase] = useState(false);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<Source | "All">("All");
  const [toast, setToast] = useState<string | null>(null);
  const copy = roleCopy[role];
  const filteredEvents = useMemo(() => events.filter((event) => sourceFilter === "All" || event.source === sourceFilter), [sourceFilter]);
  const searchResults = useMemo(() => events.filter((event) => `${event.title} ${event.detail} ${event.source}`.toLowerCase().includes(search.toLowerCase())), [search]);

  useEffect(() => {
    function closeOverlays(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setSelectedEvent(null);
      setShowNewCase(false);
    }
    window.addEventListener("keydown", closeOverlays);
    return () => window.removeEventListener("keydown", closeOverlays);
  }, []);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  async function copyBrief() {
    await navigator.clipboard?.writeText(`${copy.title}\n\n${copy.summary}\n\nNext: ${copy.action}`);
    notify("Brief copied to clipboard");
  }

  function exportTimeline() {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "headstart-investigation-timeline.json";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Timeline exported");
  }

  return <main className={styles.studyShell}>
    <header className={styles.studyHeader}><div><p className={styles.eyebrow}>Headstart · interactive product study</p><h1>A working investigation workspace</h1></div><p>Click through the app to evaluate the end-to-end experience: cases, audience views, source evidence, search, settings, and handoff behavior.</p></header>
    <AppShell view={view} setView={setView} onNewCase={() => setShowNewCase(true)}>
      {view === "cases" ? <CasesView role={role} setRole={setRole} selectedCase={selectedCase} setSelectedCase={setSelectedCase} events={filteredEvents} sourceFilter={sourceFilter} setSourceFilter={setSourceFilter} onOpenEvent={setSelectedEvent} onShare={() => notify("Handoff preview ready") } onCopy={copyBrief} onExport={exportTimeline} copy={copy} /> : null}
      {view === "search" ? <SearchView search={search} setSearch={setSearch} results={searchResults} onOpenEvent={setSelectedEvent} /> : null}
      {view === "settings" ? <SettingsView /> : null}
    </AppShell>
    {selectedEvent ? <EvidenceDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} /> : null}
    {showNewCase ? <NewCaseModal onClose={() => setShowNewCase(false)} onStart={() => { setShowNewCase(false); notify("Investigation queued for review"); }} /> : null}
    {toast ? <div className={styles.toast} role="status">{toast}</div> : null}
  </main>;
}

function AppShell({ children, view, setView, onNewCase }: { children: ReactNode; view: AppView; setView: (view: AppView) => void; onNewCase: () => void }) {
  return <article className={styles.appFrame}>
    <aside className={styles.appRail}><div className={styles.logo}>h<span>·</span></div><RailButton icon="⌂" label="Cases" active={view === "cases"} onClick={() => setView("cases")} /><RailButton icon="⌕" label="Search" active={view === "search"} onClick={() => setView("search")} /><RailButton icon="⚙" label="Settings" active={view === "settings"} onClick={() => setView("settings")} /><button className={styles.railNew} type="button" onClick={onNewCase}>＋</button><div className={styles.railBottom}>JC</div></aside>
    <section className={styles.appMain}><header className={styles.appHeader}><div><span className={styles.appName}>Headstart</span><span className={styles.breadcrumb}> / {view === "cases" ? "Investigations" : view[0].toUpperCase() + view.slice(1)}</span></div><div className={styles.headerActions}><span className={styles.sync}>● Read-only · synced 2m ago</span><button className={styles.newInvestigationButton} type="button" onClick={onNewCase}>＋ New investigation</button><button className={styles.iconButton} type="button">•••</button></div></header>{children}</section>
  </article>;
}

function RailButton({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) { return <button className={active ? styles.railActive : ""} type="button" onClick={onClick}>{icon}<small>{label}</small></button>; }

function CasesView({ role, setRole, selectedCase, setSelectedCase, events, sourceFilter, setSourceFilter, onOpenEvent, onShare, onCopy, onExport, copy }: { role: Role; setRole: (role: Role) => void; selectedCase: typeof cases[number]; setSelectedCase: (item: typeof cases[number]) => void; events: TimelineEvent[]; sourceFilter: Source | "All"; setSourceFilter: (source: Source | "All") => void; onOpenEvent: (event: TimelineEvent) => void; onShare: () => void; onCopy: () => void; onExport: () => void; copy: typeof roleCopy[Role] }) {
  const summary = selectedCase.id === "vistaprint" ? copy.summary : selectedCase.summary;
  return <div className={styles.workspace}><aside className={styles.caseList}><div className={styles.caseListTop}><span className={styles.sectionLabel}>MY INVESTIGATIONS</span><button type="button">＋</button></div><div className={styles.searchBox}>⌕ <span>Search cases</span></div>{cases.map((item) => <button className={`${styles.caseItem} ${selectedCase.id === item.id ? styles.caseSelected : ""}`} key={item.id} type="button" onClick={() => setSelectedCase(item)}><span className={`${styles.caseDot} ${selectedCase.id === item.id ? styles.yellowDot : ""}`} /><span><b>{item.name}</b><small>{item.updated} · {item.status}</small></span></button>)}</aside><section className={styles.caseContent}><div className={styles.caseTitleRow}><div><span className={styles.statusPill}>● {selectedCase.status}</span><h2>{selectedCase.name}</h2><p className={styles.muted}>Customer account · Investigation started Nov 2, 2026</p></div><button className={styles.primaryButton} type="button" onClick={onShare}>Share handoff</button></div><AudienceTabs role={role} setRole={setRole} /><div className={styles.summaryPanel}><div><span className={styles.sectionLabel}>{copy.label}</span><h3>{copy.title}</h3><p>{summary}</p></div><div className={styles.confidence}><span>Confidence</span><b>{selectedCase.id === "aurora" ? "High" : "Medium"}</b><i><em /></i><small>Based on {events.length} records</small></div></div>{role === "technical" ? <TechnicalView events={events} sourceFilter={sourceFilter} setSourceFilter={setSourceFilter} onOpenEvent={onOpenEvent} onExport={onExport} /> : <AudienceView role={role} copy={copy} onCopy={onCopy} />}</section></div>;
}

function AudienceTabs({ role, setRole }: { role: Role; setRole: (role: Role) => void }) { return <div className={styles.roleTabs} role="tablist" aria-label="Audience view">{(["executive", "csm", "technical"] as Role[]).map((item) => <button key={item} className={role === item ? styles.roleTabActive : ""} onClick={() => setRole(item)} role="tab" aria-selected={role === item} type="button">{item === "csm" ? "CSM" : item[0].toUpperCase() + item.slice(1)}</button>)}</div>; }

function AudienceView({ role, copy, onCopy }: { role: Role; copy: typeof roleCopy[Role]; onCopy: () => void }) { return <><div className={styles.cardGrid}><InfoCard label={role === "executive" ? "Business impact" : "Next best move"} title={role === "executive" ? "Possible continued customer impact" : copy.action} detail={copy.bullets[0]} /><InfoCard label={role === "executive" ? "Decision required" : "What remains unclear"} title={copy.bullets[2]} detail="Headstart will not call the issue resolved without validation evidence." /></div><div className={styles.activityCard}><div className={styles.cardHeader}><span className={styles.sectionLabel}>{role === "executive" ? "EXECUTIVE SNAPSHOT" : "CUSTOMER-SAFE TALKING POINTS"}</span><button type="button" onClick={onCopy}>Copy brief</button></div>{copy.bullets.map((bullet) => <div className={styles.activityRow} key={bullet}><span className={styles.sourceBadge}>✓</span><div><b>{bullet}</b><small>{role === "executive" ? "Decision context from the investigation" : "Derived from the investigation evidence"}</small></div><span className={styles.rowArrow}>→</span></div>)}</div><div className={styles.followUpCard}><span className={styles.sectionLabel}>RECOMMENDED FOLLOW-UP</span><h3>{copy.action}</h3><p>{role === "executive" ? "Assign an owner and confirm the customer communication plan." : "Review the supporting records before sharing this summary externally."}</p><button className={styles.textButton} type="button" onClick={onCopy}>Copy handoff brief →</button></div></>; }

function TechnicalView({ events, sourceFilter, setSourceFilter, onOpenEvent, onExport }: { events: TimelineEvent[]; sourceFilter: Source | "All"; setSourceFilter: (source: Source | "All") => void; onOpenEvent: (event: TimelineEvent) => void; onExport: () => void }) { const hasSource = (source: Source) => events.some((event) => event.source === source); return <div className={styles.technicalView}><div className={styles.sectionHeading}><div><span className={styles.sectionLabel}>TECHNICAL HISTORY</span><h3>Chronological evidence</h3></div><span className={styles.sourceCount}>{events.length} records · oldest first</span></div><div className={styles.technicalToolbar}><div className={styles.filterChips}>{(["All", "Jira", "Slack", "Zendesk", "Wiki"] as const).map((source) => <button className={sourceFilter === source ? styles.filterActive : ""} key={source} onClick={() => setSourceFilter(source)} type="button">{source}</button>)}</div><button className={styles.textButton} type="button" onClick={onExport}>Export timeline ↗</button></div><div className={styles.coverageRow}>{(["Jira", "Slack", "Zendesk", "Wiki"] as Source[]).map((source) => <span className={hasSource(source) ? "" : styles.coverageMissing} key={source}>{source} · {hasSource(source) ? "found" : "no records"}</span>)}</div>{events.some((event) => event.type === "Recurrence") ? <div className={styles.conflictCard}><span className={styles.sectionLabel}>CONFLICTING EVIDENCE</span><b>Earlier work was marked complete, but a later discussion reports the same pattern.</b><small>Review the closed Jira record and the later Slack recurrence together.</small></div> : null}<div className={styles.commandTimeline}>{events.map((event) => <div className={styles.commandTimelineEvent} key={event.id}><time>{event.date}<small>{event.type}</small></time><div className={styles.commandTimelineNode} /><div className={styles.commandTimelineCard}><div><span className={`${styles.sourceBadge} ${styles[`source-${sourceTone[event.source]}`]}`}>{event.source[0]}</span><span className={styles.eventSource}>{event.source}</span><span className={styles.eventTag}>{event.status}</span></div><h4>{event.title}</h4><p>{event.detail}</p><button className={styles.textButton} type="button" onClick={() => onOpenEvent(event)}>Inspect evidence →</button></div></div>)}</div></div>; }

function SearchView({ search, setSearch, results, onOpenEvent }: { search: string; setSearch: (value: string) => void; results: TimelineEvent[]; onOpenEvent: (event: TimelineEvent) => void }) { return <div className={styles.searchView}><div className={styles.searchHero}><span className={styles.sectionLabel}>SEARCH PROTOTYPE RECORDS</span><h2>Find the context behind an issue.</h2><p>Search across the records currently loaded in this prototype. Live source search will add account and workspace scope.</p><div className={styles.globalSearch}>⌕<input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try “catalog image”, “postback”, or a ticket number" /></div></div><div className={styles.searchResultsHeader}><span className={styles.sectionLabel}>MATCHING EVIDENCE</span><span>{results.length} records</span></div>{results.length ? results.map((event) => <button className={styles.searchResult} key={event.id} type="button" onClick={() => onOpenEvent(event)}><span className={`${styles.sourceBadge} ${styles[`source-${sourceTone[event.source]}`]}`}>{event.source[0]}</span><div><b>{event.title}</b><small>{event.source} · {event.date} · {event.type}</small><p>{event.detail}</p></div><span>→</span></button>) : <div className={styles.emptyState}>No matching records. Try a broader term or search by ticket number.</div>}</div>; }

function SettingsView() { const [enabled, setEnabled] = useState<Record<Source, boolean>>({ Slack: true, Jira: true, Zendesk: true, Wiki: true }); return <div className={styles.settingsView}><div className={styles.settingsIntro}><span className={styles.sectionLabel}>WORKSPACE SETTINGS</span><h2>Control what Headstart can use.</h2><p>These settings describe the investigation boundary. Headstart is read-only and does not change source systems.</p></div><section className={styles.settingsCard}><div className={styles.cardHeader}><span className={styles.sectionLabel}>CONNECTED SOURCES</span><span className={styles.settingsStatus}>Read-only access</span></div>{(Object.keys(enabled) as Source[]).map((source) => <div className={styles.settingRow} key={source}><span className={`${styles.sourceBadge} ${styles[`source-${sourceTone[source]}`]}`}>{source[0]}</span><div><b>{source === "Wiki" ? "Wiki / Confluence" : source}</b><small>{enabled[source] ? "Available for investigations" : "Excluded from new investigations"}</small></div><button className={`${styles.toggle} ${enabled[source] ? styles.toggleOn : ""}`} onClick={() => setEnabled({ ...enabled, [source]: !enabled[source] })} type="button"><span /></button></div>)}</section><section className={styles.settingsCard}><div className={styles.cardHeader}><span className={styles.sectionLabel}>TRUST & OUTPUT</span></div><div className={styles.settingRow}><div><b>Require evidence for resolution claims</b><small>Enabled · recommended</small></div><span className={styles.check}>✓</span></div><div className={styles.settingRow}><div><b>Show source links in handoffs</b><small>Enabled</small></div><span className={styles.check}>✓</span></div></section></div>; }

function EvidenceDrawer({ event, onClose }: { event: TimelineEvent; onClose: () => void }) { return <div className={styles.drawerBackdrop} onClick={onClose}><aside className={styles.evidenceDrawer} aria-label="Evidence inspector" onClick={(event) => event.stopPropagation()}><div className={styles.drawerHeader}><span className={styles.sectionLabel}>EVIDENCE INSPECTOR</span><button type="button" aria-label="Close evidence inspector" onClick={onClose}>×</button></div><div className={styles.drawerBody}><span className={`${styles.sourceBadge} ${styles[`source-${sourceTone[event.source]}`]}`}>{event.source[0]}</span><span className={styles.eventSource}>{event.source} · {event.type}</span><h2>{event.title}</h2><p className={styles.drawerDate}>{event.date} · {event.status}</p><div className={styles.quoteBox}>“{event.detail}”</div><div className={styles.drawerSection}><span className={styles.sectionLabel}>WHY IT MATTERS</span><p>This record was selected because it changes the interpretation of the customer’s technical history. It should be reviewed alongside earlier and later records.</p></div><div className={styles.drawerSection}><span className={styles.sectionLabel}>SOURCE RECORD</span><span className={styles.sourceUnavailable}>{event.link} · direct link will be supplied by the live connector</span></div></div><div className={styles.drawerFooter}><button className={styles.primaryButton} type="button" onClick={onClose}>Done reviewing</button></div></aside></div>; }

function NewCaseModal({ onClose, onStart }: { onClose: () => void; onStart: () => void }) { return <div className={styles.modalBackdrop} onClick={onClose}><div className={styles.newCaseModal} role="dialog" aria-modal="true" aria-labelledby="new-investigation-title" onClick={(event) => event.stopPropagation()}><div className={styles.drawerHeader}><div><span className={styles.sectionLabel}>NEW INVESTIGATION</span><h2 id="new-investigation-title">Start with a question</h2></div><button type="button" aria-label="Close new investigation" onClick={onClose}>×</button></div><label>Customer or account<input defaultValue="Jellycat" /></label><label>What do you need to understand?<textarea defaultValue="Why is the customer seeing this issue, and what relevant history should I know before responding?" /></label><div className={styles.scopePreview}><span className={styles.sectionLabel}>SEARCH SCOPE</span><p>Slack · Jira · Zendesk · Wiki / Confluence</p><small>Read-only · account-level technical history · current and historical records</small></div><div className={styles.modalActions}><button className={styles.textButton} type="button" onClick={onClose}>Cancel</button><button className={styles.primaryButton} type="button" onClick={onStart}>Start investigation →</button></div></div></div>; }

function InfoCard({ label, title, detail }: { label: string; title: string; detail: string }) { return <div className={styles.infoCard}><span className={styles.sectionLabel}>{label}</span><b>{title}</b><small>{detail}</small></div>; }
