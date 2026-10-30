import { NextResponse } from "next/server";
import { investigate } from "@threadline/core";
import { isSourceName, SOURCE_NAMES } from "@threadline/core/src/sources";
import type { SourceName } from "@threadline/core";

const MAX_CUSTOMER_LENGTH = 120;
const MAX_QUESTION_LENGTH = 500;

type InvestigationRequestBody = { customer?: unknown; question?: unknown; sources?: unknown };

function badRequest(error: string, details?: string) {
  return NextResponse.json({ error, ...(details ? { details } : {}) }, { status: 400 });
}

export async function POST(request: Request) {
  let body: InvestigationRequestBody;
  try {
    body = (await request.json()) as InvestigationRequestBody;
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return badRequest("Request body must be a JSON object.");
  }

  if (typeof body.customer !== "string" || !body.customer.trim()) return badRequest('"customer" must be a non-empty string.');
  if (typeof body.question !== "string" || !body.question.trim()) return badRequest('"question" must be a non-empty string.');

  const customer = body.customer.trim();
  const question = body.question.trim();
  if (customer.length > MAX_CUSTOMER_LENGTH || question.length > MAX_QUESTION_LENGTH) {
    return badRequest(`"customer" must be at most ${MAX_CUSTOMER_LENGTH} characters and "question" at most ${MAX_QUESTION_LENGTH} characters.`);
  }

  let sourceNames: SourceName[] | undefined;
  if (body.sources !== undefined) {
    if (!Array.isArray(body.sources)) return badRequest('"sources" must be an array of source names.');
    if (body.sources.length === 0) return badRequest('"sources" must contain at least one source when provided.');
    const invalid = body.sources.find((source) => !isSourceName(source));
    if (invalid !== undefined) return badRequest(`Unsupported source "${String(invalid)}".`, `Use one of: ${SOURCE_NAMES.join(", ")}.`);
    sourceNames = Array.from(new Set(body.sources)) as SourceName[];
  }

  try {
    const result = await investigate({ customer, question }, { sourceNames });
    return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Investigation orchestration failed", error);
    return NextResponse.json({ error: "Investigation could not be completed.", details: "Retry the request or select fewer sources." }, { status: 502 });
  }
}
