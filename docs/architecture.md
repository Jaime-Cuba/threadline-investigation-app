# Threadline MVP architecture

The web app owns the user experience. The investigation core owns the channel-neutral input and output contract. Source adapters will be added behind the API route and must return normalized evidence records.

For the first public demo, the repository is unauthenticated and fixture-backed. Do not add customer data or real connector credentials. When live reads are introduced, use request-scoped read-only access and make source-level failures visible in the result.
