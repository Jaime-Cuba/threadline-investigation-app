# Threadline MVP architecture

The web app owns the user experience. The investigation core owns the channel-neutral input and output contract. Source adapters sit behind the API route and return normalized evidence records.

The current demo is fixture-backed and includes Slack-, Jira-, and Confluence-shaped sources. The connector plan is documented in `docs/source-adapters.md`. The UI is intentionally unaware of whether evidence came from a fixture or a live source.

When live reads are introduced, use request-scoped read-only access, keep credentials server-side, require authenticated internal hosting, and make source-level failures visible in the result. Do not add customer data or real connector credentials to this repository.
