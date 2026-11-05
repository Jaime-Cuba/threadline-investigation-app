"use client";

import { useMemo, useState } from "react";
import styles from "./technical-v2.module.css";

type Source = "Zendesk" | "Jira" | "Slack" | "Wiki";
type EventType = "Diagnosis" | "Decision" | "Recurrence" | "Workaround" | "Gap";

type Event = {
  id: string;
  date: string;
  day: string;
  source: Source;
  type: EventType;
  title: string;
  detail: string;
  status: string;
  evidence: string;
};

const events: Event[] = [
  { id: "zd-4821", date: "May 14", day: "2026", source: "Zendesk", type: "Diagnosis", title: "Creative rendering issue first reported", detail: "Selected campaign creatives were not rendering as expected for a subset of journeys.", status: "Reported", evidence: "Zendesk #4821 · customer conversation" },
  { id: "cat-284", date: "Jun 03", day: "2026", source: "Jira", type: "Decision", title: "Identity-side mapping change marked complete", detail: "CAT-284 records a mapping change on the Attentive side. Customer retesting is not documented.", status: "Closed · unvalidated", evidence: "CAT-284 · Jira issue and comments" },
  { id: "slack-1028", date: "Sep 18", day: "2026", source: "Slack", type: "Recurrence", title: "Creative issue reported again", detail: "The team questioned whether the same pattern returned after a VistaPrint-side creative update.", status: "Recurrence", evidence: "#customer-escalations · thread 1028" },
  { id: "cat-291", date: "Oct 02", day: "2026", source: "Jira", type: "Workaround", title: "Temporary journey workaround applied", detail: "CAT-291 documents a temporary suppression while the source creative and identity mapping were compared.", status: "Temporary", evidence: "CAT-291 · Jira issue and comments" },
  { id: "wiki-1102", date: "Nov 02", day: "2026", source: "Wiki", type: "Gap", title: "Runbook reviewed; current mapping still unknown", detail: "The runbook describes the expected flow but does not confirm VistaPrint’s current mapping or validation result.", status: "Needs proof", evidence: "Creative integration runbook · Wiki" },
];

const sourceStyles: Record<Source, string> = { Zendesk: "zendesk", Jira: "jira", Slack: "slack", Wiki: "wiki" };

export default function TechnicalV2Page() {
  const [activeView, setActiveView] = useState("Timeline");
  const [filter, setFilter] = useState<Source | "All">("All");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCurrentState, setShowCurrentState] = useState(true);
  const filteredEvents = useMemo(() => filter === "All" ? events : events.filter((event) => event.source === filter), [filter]);

  return <main className={styles.page}>
    <header className={styles.studyHeader}>
      <div><span className={styles.kicker}>Headstart · Technical tab V2</span><h1>Investigation Command Center</h1></div>
      <p>Prototype: Bird-inspired diagnostic context with Headstart’s evidence-grounded interpretation.</p>
    </header>

    <section className={styles.app}>
      <header className={styles.appHeader}>
        <div className={styles.brand}><span className={styles.logo}>h<span>·</span></span><b>Headstart</b><span className={styles.slash}>/</span><span>Technical</span></div>
        <div className={styles.headerActions}><span className={styles.readOnly}>● Read-only · refreshed 2m ago</span><button className={styles.shareButton} type="button">Share handoff</button><button className={styles.moreButton} type="button">•••</button></div>
      </header>

      <div className={styles.scopeBar}>
        <label>ACCOUNT <b>VistaPrint</b></label><label>ENVIRONMENT <b>Production</b></label><label>LOOKBACK <b>May 14 – Nov 02, 2026</b></label><label>SOURCES <b>4 searched</b></label><span className={styles.scopeState}>✓ account unresolved by name only</span>
      </div>

      <div className={styles.body}>
        <div className={styles.mainColumn}>
          <div className={styles.titleRow}><div><span className={styles.statusPill}>● Investigation in progress</span><h2>Creative rendering issue</h2><p>VistaPrint · Technical investigation · 5 relevant records</p></div><button className={styles.outlineButton} type="button">Export JSON ↗</button></div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryTop}><span className={styles.kicker}>TECHNICAL READ</span><span className={styles.confidence}>Medium confidence</span></div>
            <h3>The history points to two related layers, but the current fix is not verified.</h3>
            <p>The record shows an initial creative issue, an Attentive-side identity mapping change, a later recurrence after a VistaPrint-side creative update, and a temporary journey workaround. Before treating this as resolved, confirm the current mapping and retest one affected journey.</p>
            <div className={styles.summaryMeta}><span><b>What changed</b> Identity mapping + source creative</span><span><b>What is current</b> Temporary suppression is reported</span><span><b>What is missing</b> Customer retest evidence</span></div>
          </div>

          <div className={styles.healthGrid}>
            <Metric label="RELEVANT RECORDS" value="5" note="across 4 sources" tone="neutral" />
            <Metric label="RECURRING SIGNAL" value="1" note="after a recorded change" tone="warn" />
            <Metric label="VALIDATED FIXES" value="0" note="no customer retest found" tone="danger" />
            <Metric label="OPEN GAPS" value="3" note="current setup needs proof" tone="gold" />
          </div>

          <nav className={styles.tabs} aria-label="Technical detail views">{["Timeline", "Integrations", "Configuration", "Feature flags"].map((view) => <button key={view} className={activeView === view ? styles.activeTab : ""} onClick={() => setActiveView(view)} type="button">{view}</button>)}</nav>

          {activeView === "Timeline" ? <>
            <div className={styles.chartCard}>
              <div className={styles.sectionHeader}><div><span className={styles.kicker}>ACTIVITY OVERVIEW</span><h3>History density by source</h3></div><span className={styles.dateLabel}>May → Nov 2026</span></div>
              <div className={styles.chart} aria-label="Activity overview chart"><div className={styles.chartLabels}><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span></div><div className={styles.bars}>{["zendesk", "jira", "slack", "wiki"].map((tone, index) => <div className={`${styles.bar} ${styles[tone]}`} key={tone} style={{ height: `${[39, 73, 52, 28][index]}%` }}><span /></div>)}</div><div className={styles.chartLegend}>{(["Zendesk", "Jira", "Slack", "Wiki"] as Source[]).map((source) => <span key={source}><i className={`${styles.legendDot} ${styles[sourceStyles[source]]}`} />{source}</span>)}</div></div>
            </div>
            <div className={styles.timelineHeader}><div><span className={styles.kicker}>CHRONOLOGICAL EVIDENCE</span><h3>What happened, oldest to newest</h3></div><span>{filteredEvents.length} shown</span></div>
            <div className={styles.filters}><div>{(["All", "Zendesk", "Jira", "Slack", "Wiki"] as const).map((item) => <button key={item} className={filter === item ? styles.filterActive : ""} onClick={() => setFilter(item)} type="button">{item}</button>)}</div><span className={styles.filterHint}>Select an event to inspect evidence</span></div>
            <div className={styles.timeline}>{filteredEvents.map((event) => <button className={styles.timelineEvent} key={event.id} onClick={() => setSelectedEvent(event)} type="button"><div className={styles.eventDate}>{event.date}<small>{event.day}</small></div><div className={`${styles.eventNode} ${styles[sourceStyles[event.source]]}`} /><div className={styles.eventCard}><div className={styles.eventTop}><span className={`${styles.sourceBadge} ${styles[sourceStyles[event.source]]}`}>{event.source[0]}</span><span className={styles.eventSource}>{event.source}</span><span className={styles.eventType}>{event.type}</span><span className={styles.eventStatus}>{event.status}</span></div><h4>{event.title}</h4><p>{event.detail}</p><span className={styles.inspect}>Inspect evidence →</span></div></button>)}</div>
          </> : <PlaceholderView view={activeView} />}
        </div>

        <aside className={styles.sideColumn}>
          <div className={styles.sideCard}><div className={styles.sideHeader}><span className={styles.kicker}>CURRENT STATE</span><button type="button" onClick={() => setShowCurrentState(!showCurrentState)}>{showCurrentState ? "Hide" : "Show"}</button></div>{showCurrentState ? <div className={styles.stateList}><StateRow label="Creative source" value="VistaPrint-side update reported" status="historical" /><StateRow label="Identity mapping" value="Changed in CAT-284" status="unvalidated" /><StateRow label="Journey behavior" value="Temporary suppression reported" status="temporary" /><StateRow label="Current configuration" value="Not inspected" status="unknown" /></div> : null}</div>
          <div className={styles.sideCard}><div className={styles.sideHeader}><span className={styles.kicker}>SOURCE COVERAGE</span><span className={styles.coverageCount}>4 / 4</span></div>{(["Zendesk", "Jira", "Slack", "Wiki"] as Source[]).map((source) => <div className={styles.coverageRow} key={source}><span className={`${styles.sourceBadge} ${styles[sourceStyles[source]]}`}>{source[0]}</span><div><b>{source}</b><small>{source === "Wiki" ? "1 relevant document" : source === "Jira" ? "2 relevant issues" : "1 relevant record"}</small></div><span className={styles.coverageCheck}>✓</span></div>)}</div>
          <div className={`${styles.sideCard} ${styles.gapCard}`}><span className={styles.kicker}>NEXT TECHNICAL CHECK</span><h3>Verify the current mapping before recommending another workaround.</h3><ol><li>Confirm the VistaPrint creative identifier.</li><li>Inspect the current identity mapping.</li><li>Retest one affected journey end to end.</li></ol><button className={styles.textButton} type="button">Copy investigation checklist →</button></div>
        </aside>
      </div>
    </section>

    {selectedEvent ? <div className={styles.backdrop} onClick={() => setSelectedEvent(null)}><aside className={styles.drawer} onClick={(event) => event.stopPropagation()}><div className={styles.drawerHeader}><span className={styles.kicker}>EVIDENCE INSPECTOR</span><button type="button" onClick={() => setSelectedEvent(null)}>×</button></div><div className={styles.drawerBody}><span className={`${styles.sourceBadge} ${styles[sourceStyles[selectedEvent.source]]}`}>{selectedEvent.source[0]}</span><span className={styles.drawerSource}>{selectedEvent.source} · {selectedEvent.type}</span><h2>{selectedEvent.title}</h2><p className={styles.drawerDate}>{selectedEvent.date}, {selectedEvent.day} · {selectedEvent.status}</p><blockquote>{selectedEvent.detail}</blockquote><section><span className={styles.kicker}>WHY IT MATTERS</span><p>{selectedEvent.type === "Recurrence" ? "This is a later signal after an earlier change, so the historical closure cannot be treated as a validated fix." : "This record contributes context, but it does not independently prove the current account configuration or customer outcome."}</p></section><section><span className={styles.kicker}>ORIGINAL SOURCE</span><p>{selectedEvent.evidence}</p><button className={styles.sourceLink} type="button">Open source record ↗</button></section></div><footer><button className={styles.outlineButton} type="button" onClick={() => setSelectedEvent(null)}>Close inspector</button></footer></aside></div> : null}
  </main>;
}

function Metric({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) { return <div className={`${styles.metric} ${styles[tone]}`}><span>{label}</span><b>{value}</b><small>{note}</small></div>; }
function StateRow({ label, value, status }: { label: string; value: string; status: string }) { return <div className={styles.stateRow}><div><b>{label}</b><small>{value}</small></div><span className={`${styles.stateTag} ${status === "unknown" ? styles.stateUnknown : ""}`}>{status}</span></div>; }
function PlaceholderView({ view }: { view: string }) { return <div className={styles.placeholder}><span className={styles.kicker}>{view.toUpperCase()}</span><h3>{view} detail view</h3><p>This prototype keeps the same Technical shell while these views are expanded. The Timeline remains the primary investigation path.</p></div>; }
