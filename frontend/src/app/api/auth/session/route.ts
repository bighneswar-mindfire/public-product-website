import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signSessionToken } from "@/auth/jwt";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const email = body.email;
    const uid = body.uid;

    if (!email || !uid || typeof email !== "string" || typeof uid !== "string") {
      return NextResponse.json({ error: "Missing session parameters." }, { status: 400 });
    }

    const signedToken = await signSessionToken({ email, uid });

    const cookieStore = await cookies();
    cookieStore.set("firebase-session", signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session write error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("firebase-session");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
