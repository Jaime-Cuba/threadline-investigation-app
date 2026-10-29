import { NextResponse } from "next/server";
import { investigate, SourceName } from "@threadline/core";

export async function POST(request: Request) {
  const body = (await request.json()) as { customer?: string; question?: string; sources?: string[] };
  const customer = body.customer?.trim();
  const question = body.question?.trim();

  if (!customer || !question) {
    return NextResponse.json({ error: "customer and question are required" }, { status: 400 });
  }

  if (customer.length > 120 || question.length > 500) {
    return NextResponse.json({ error: "customer or question is too long" }, { status: 400 });
  }

  const validSources = new Set<SourceName>(["slack", "jira", "confluence"]);
  const sourceNames = body.sources?.length ? body.sources : undefined;
  if (sourceNames?.some((source) => !validSources.has(source as SourceName))) {
    return NextResponse.json({ error: "sources must be slack, jira, or confluence" }, { status: 400 });
  }

  return NextResponse.json(await investigate({ customer, question }, { sourceNames: sourceNames as SourceName[] | undefined }));
}
