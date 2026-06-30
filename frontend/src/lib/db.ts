// frontend/src/lib/db.ts

declare global {
  var subscribers: string[];
}

if (!globalThis.subscribers) {
  globalThis.subscribers = ["developer@example.com", "earlytester@example.com"];
}

export const db = {
  getSubscribers: (): string[] => {
    return globalThis.subscribers;
  },
  addSubscriber: (email: string): { success: boolean; count?: number; error?: string } => {
    const formattedEmail = email.toLowerCase().trim();
    if (!globalThis.subscribers.includes(formattedEmail)) {
      globalThis.subscribers.push(formattedEmail);
      return { success: true, count: globalThis.subscribers.length };
    }
    return { success: false, error: "Already subscribed" };
  },
};
