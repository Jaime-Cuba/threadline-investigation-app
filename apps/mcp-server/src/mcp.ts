import * as z from "zod/v4";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WIDGET_URI, widgetHtml } from "./widget.js";

const evidenceSchema = z.object({
  id: z.string(),
  source: z.enum(["slack", "jira", "zendesk", "confluence"]),
  kind: z.enum(["discussion", "ticket", "documentation", "custom_work"]),
  title: z.string(),
  excerpt: z.string(),
  relevance: z.enum(["high", "medium", "low"]),
  status: z.string().optional(),
  author: z.string().optional(),
  timestamp: z.string(),
  url: z.string().optional(),
  whyItMatters: z.string(),
});

const investigationPrompt = `You are Threadline, an investigation assistant for Attentive customer-facing teams.

Your job is to reconstruct the technical history behind a customer problem using the connected Slack, Jira, Zendesk, and Confluence apps.

Start with the user's question and extract everything already known. Do not ask for information that is already present. Before searching, check whether you have enough context about the customer or account, product or integration, current symptom, expected behavior, timeframe, error details, relevant ticket or channel, recent changes, and known workarounds.

If important context is missing, ask no more than three concise clarifying questions. Ask only questions that materially improve search accuracy. Do not ask for subscriber names, phone numbers, email addresses, access tokens, passwords, or other sensitive personal data. Ask for safe identifiers such as account names, ticket keys, error messages, dates, feature names, or integration names.

Once enough context is available:
1. Search connected Slack, Jira, Zendesk, and Confluence sources for the current issue and related historical terms.
2. Look for previous tickets, workarounds, custom work, configuration discussions, ownership changes, closure notes, and recurrence evidence.
3. Compare older records with newer records. Treat old workarounds and closed tickets as historical unless current evidence confirms they are still active.
4. Separate confirmed facts from assumptions, unknowns, and conflicting records.
5. Do not invent records, links, dates, owners, fixes, or current configuration.
6. Keep the investigation read-only. Do not create, update, close, or comment on tickets or messages.
7. Do not include subscriber-level or consumer PII in the rendered result. Summarize account-level technical context instead.

Then call Threadline's render_investigation tool with a plain-language summary, confirmed facts, unclear items, recommended next steps, and the most relevant source evidence. If no useful history is found, say so clearly and explain what context is missing.`;

export function createServer() {
  const server = new McpServer({ name: "threadline-investigation", version: "0.1.0" });
  server.registerResource("threadline-investigation-ui", WIDGET_URI, { mimeType: "text/html;profile=mcp-app" }, async () => ({
    contents: [{ uri: WIDGET_URI, mimeType: "text/html;profile=mcp-app", text: widgetHtml, _meta: { ui: { prefersBorder: true } } }],
  }));
  server.registerPrompt("threadline-investigation", {
    description: "Guide ChatGPT through a read-only customer investigation using connected Slack, Jira, Zendesk, and Confluence apps before rendering Threadline. Ask at most three focused clarifying questions when context is missing.",
    argsSchema: { customer: z.string().describe("Customer or account name"), question: z.string().describe("Customer problem to investigate") },
  }, async ({ customer, question }) => ({ messages: [{ role: "user", content: { type: "text", text: `${investigationPrompt}\n\nInvestigation request:\nCustomer or account: ${customer}\nQuestion: ${question}` } }] }));
  server.registerTool("render_investigation", {
    title: "Render Threadline investigation",
    description: "Render a read-only Threadline investigation after gathering relevant evidence from connected Slack, Jira, Zendesk, and Confluence apps. Use only evidence returned by those sources, omit subscriber-level PII, and preserve unknowns and conflicting information. Use this after searching the connected apps; do not use it to create or modify records.",
    inputSchema: {
      customer: z.string().describe("Customer or account name"), question: z.string().describe("The original investigation question"), summary: z.string().describe("Plain-language summary of the investigation"), knownFacts: z.array(z.string()).describe("Confirmed facts supported by the source evidence"), unclearItems: z.array(z.string()).describe("Unknown, conflicting, or unverified items"), suggestedNextSteps: z.array(z.string()).describe("Recommended next investigation steps"), evidence: z.array(evidenceSchema).describe("Relevant source records from connected apps"),
    },
    _meta: { ui: { resourceUri: WIDGET_URI }, "openai/toolInvocation/invoking": "Preparing Threadline investigation…", "openai/toolInvocation/invoked": "Threadline investigation ready" },
  }, async (input) => ({ structuredContent: input, content: [{ type: "text", text: `Threadline investigation ready for ${input.customer}.` }] }));
  return server;
}
