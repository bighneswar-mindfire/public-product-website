import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let adminAuth: Auth | null = null;

export function getAdminAuth(): Auth {
  if (adminAuth) {
    return adminAuth;
  }

  const app: App = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert(loadServiceAccount()) });

  adminAuth = getAuth(app);
  return adminAuth;
}

function loadServiceAccount(): Record<string, string> {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Server-side Firebase token " +
        "verification cannot run without a service account credential."
    );
  }

  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch (error) {
    throw new Error(`FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON: ${(error as Error).message}`);
  }
}
