import { NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const subscribers = await db.getSubscribers();

    return NextResponse.json({
      totalUsers: subscribers.length,
    });
  } catch (error) {
    captureException(error);
    console.error("Failed to fetch dynamic platform stats:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while retrieving platform telemetry." },
      { status: 500 }
    );
  }
}
