import { NextResponse } from "next/server";
import { investigate } from "@threadline/core";

export async function POST(request: Request) {
  const body = (await request.json()) as { customer?: string; question?: string };
  if (!body.customer || !body.question) {
    return NextResponse.json({ error: "customer and question are required" }, { status: 400 });
  }

  return NextResponse.json(investigate({ customer: body.customer, question: body.question }));
}
