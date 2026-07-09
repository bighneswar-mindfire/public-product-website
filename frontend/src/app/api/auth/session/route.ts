import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signSessionToken } from "@/auth/jwt";
import { getAdminAuth } from "@/auth/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const idToken = body.idToken;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing ID token." }, { status: 400 });
    }

    let decoded;
    try {
      decoded = await getAdminAuth().verifyIdToken(idToken);
    } catch (error) {
      console.warn("Firebase ID token verification failed.", error);
      return NextResponse.json({ error: "Invalid authentication token." }, { status: 401 });
    }

    if (!decoded.email) {
      return NextResponse.json(
        { error: "Authenticated user has no email address." },
        { status: 400 }
      );
    }

    const signedToken = await signSessionToken({ email: decoded.email, uid: decoded.uid });

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
