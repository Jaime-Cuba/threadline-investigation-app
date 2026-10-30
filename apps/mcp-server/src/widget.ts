export const WIDGET_URI = "ui://threadline/investigation/v1.html";

export const widgetHtml = `
<style>
  :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  body { margin: 0; color: #171717; background: transparent; }
  .shell { background: #fffefb; border: 1px solid #e7e5dd; border-radius: 18px; padding: 22px; box-shadow: 0 12px 32px rgba(36, 33, 70, .08); }
  .eyebrow { color: #80621c; font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
  h1 { font-size: 23px; letter-spacing: -.04em; margin: 8px 0 6px; }
  h2 { font-size: 14px; margin: 0; }
  p { line-height: 1.45; margin: 0; }
  .summary { background: #fff9cf; border: 1px solid #eee3a6; border-radius: 14px; margin: 18px 0; padding: 16px; }
  .summary strong { color: #8a671d; }
  .grid { display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .panel { background: #f7f7f3; border: 1px solid #e7e5dd; border-radius: 12px; padding: 13px; }
  .panel h2 { color: #80621c; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; }
  .panel p, li { color: #555; font-size: 12px; }
  .panel ul { margin: 8px 0 0; padding-left: 18px; }
  .history { margin-top: 18px; }
  .history-header { align-items: center; display: flex; justify-content: space-between; margin-bottom: 8px; }
  .count { color: #68686a; font-size: 11px; }
  .evidence { border-top: 1px solid #e7e5dd; padding: 11px 0; }
  .evidence:first-of-type { border-top: 0; }
  .meta { color: #80621c; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .evidence h3 { font-size: 12px; margin: 4px 0; }
  .evidence p { color: #68686a; font-size: 12px; }
  .why { margin-top: 4px; }
  .footer { color: #198a63; font-size: 10px; margin-top: 13px; }
  @media (max-width: 620px) { .grid { grid-template-columns: 1fr; } }
</style>
<div id="threadline-root"></div>
<script>
  const root = document.getElementById("threadline-root");
  const openai = globalThis.openai;
  function esc(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }
  function list(items) { return (items || []).map((item) => "<li>" + esc(item) + "</li>").join(""); }
  function render(data) {
    if (!data) { root.innerHTML = "<div class=\\"shell\\">Waiting for investigation results…</div>"; return; }
    root.innerHTML = \`
      <section class="shell">
        <div class="eyebrow">Threadline investigation</div>
        <h1>\${esc(data.customer || "Customer investigation")}</h1>
        <p>\${esc(data.question || "")}</p>
        <div class="summary"><strong>In short:</strong> \${esc(data.summary)}</div>
        <div class="grid">
          <div class="panel"><h2>What we know</h2><ul>\${list(data.knownFacts)}</ul></div>
          <div class="panel"><h2>What is unclear</h2><ul>\${list(data.unclearItems)}</ul></div>
          <div class="panel"><h2>What happens next</h2><ul>\${list(data.suggestedNextSteps)}</ul></div>
        </div>
        <div class="history"><div class="history-header"><h2>Relevant history</h2><span class="count">\${(data.evidence || []).length} source records</span></div>
          \${(data.evidence || []).map((item) => \`<article class="evidence"><div class="meta">\${esc(item.source)} · \${esc(item.relevance)}</div><h3>\${esc(item.title)}</h3><p>\${esc(item.excerpt)}</p><p class="why"><strong>Why it matters:</strong> \${esc(item.whyItMatters)}</p></article>\`).join("")}
        </div>
        <div class="footer">Read-only investigation · Source results supplied by ChatGPT</div>
      </section>\`;
  }
  render(openai?.toolOutput || null);
  window.addEventListener("message", (event) => {
    if (event.source !== window.parent || event.data?.jsonrpc !== "2.0") return;
    if (event.data.method === "ui/notifications/tool-result") render(event.data.params?.structuredContent);
  }, { passive: true });
</script>`;
