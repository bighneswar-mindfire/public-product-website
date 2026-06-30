import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const subscribers = db.getSubscribers();

    return NextResponse.json({
      totalSubscribers: subscribers.length,
      activeDeployments: 1240,
      uptimePercent: 99.99,
    });
  } catch (error) {
    console.error("Failed to fetch system statistics:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while retrieving platform telemetry." },
      { status: 500 }
    );
  }
}
