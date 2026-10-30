# ChatGPT → Threadline manual handoff

This branch provides the fastest demo path while live connectors and the Investigation API are still being built.

## Demo flow

1. Open ChatGPT with the approved Slack, Jira, and Confluence connections.
2. Download the prompt from Threadline, or use `apps/web/public/chatgpt-investigation-prompt.txt`.
3. Replace the customer and problem placeholders.
4. Ask ChatGPT to search the connected apps and return only the specified JSON.
5. Save the response as `threadline-investigation.json`.
6. In Threadline, choose **Choose JSON file** and select the saved file from Downloads.
7. Threadline validates the document and renders the summary, next steps, related history, and technical details.

## Why this is a good interim architecture

The JSON document is the contract between the investigation experience and the presentation experience. ChatGPT can be replaced later by the Investigation API without requiring a UI rewrite, as long as the API returns the same shape.

The browser intentionally requires the user to select the file. A web page cannot silently inspect a user's Downloads folder, and requiring selection makes the handoff visible and reversible. The importer supports Slack, Jira, Zendesk, and Confluence evidence.

The importer rejects missing fields, unsupported source values, invalid evidence types, and malformed records. It does not silently turn uncertain content into confirmed facts.
