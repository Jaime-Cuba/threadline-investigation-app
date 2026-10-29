"use client";

import { useState } from "react";

export default function HomePage() {
  const [question, setQuestion] = useState("Why is Jellycat seeing duplicate profiles and Bloomreach delivery failures?");
  const [status, setStatus] = useState("Ready for an investigation");

  async function investigate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Investigation API placeholder — connector retrieval comes next");
    await fetch("/api/investigate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ customer: "Jellycat", question }),
    });
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 40, fontFamily: "system-ui" }}>
      <p style={{ color: "#6b5b00", fontWeight: 700 }}>THREADLINE · PUBLIC DEMO</p>
      <h1>See the story behind the issue.</h1>
      <p>Start with a customer problem. Threadline will turn related history into a clear investigation brief.</p>
      <form onSubmit={investigate} style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <input value={question} onChange={(event) => setQuestion(event.target.value)} style={{ flex: 1, padding: 14 }} />
        <button type="submit" style={{ padding: "0 18px", fontWeight: 700 }}>Investigate</button>
      </form>
      <p style={{ marginTop: 20, color: "#666" }}>{status}</p>
      <section style={{ marginTop: 40, padding: 24, background: "#fff9c7", borderRadius: 16 }}>
        <h2>Quick read</h2>
        <p>The first local version is intentionally fixture-backed. The next step is connecting approved read-only sources behind the same API contract.</p>
      </section>
    </main>
  );
}
