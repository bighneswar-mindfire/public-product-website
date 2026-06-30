import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const email = body.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address format." }, { status: 400 });
    }

    const result = db.addSubscriber(email);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Conflict occurred." }, { status: 409 });
    }

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error("Subscription process error:", error);
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 });
  }
}
