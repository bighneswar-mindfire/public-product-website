import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email format. Please enter a valid work email." }),
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const parseResult = subscribeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }

    const { email } = parseResult.data;

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
