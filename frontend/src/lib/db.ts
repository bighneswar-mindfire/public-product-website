import fs from "fs";
import path from "path";

const globalRef = global as unknown as { subscribers?: string[] };

if (!globalRef.subscribers) {
  globalRef.subscribers = [];
}

const dbPath = path.join(process.cwd(), "subscribers.json");

function initDb(): void {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify([], null, 2), "utf-8");
    } else {
      const fileData = fs.readFileSync(dbPath, "utf-8");
      globalRef.subscribers = JSON.parse(fileData) as string[];
    }
  } catch (error) {
    console.error("Failed to initialize database file:", error);
  }
}

initDb();

export const db = {
  getSubscribers: (): string[] => {
    return globalRef.subscribers || [];
  },

  addSubscriber: (email: string): { success: boolean; count?: number; error?: string } => {
    const formattedEmail = email.toLowerCase().trim();
    try {
      const subscribers = db.getSubscribers();
      if (!subscribers.includes(formattedEmail)) {
        subscribers.push(formattedEmail);
        fs.writeFileSync(dbPath, JSON.stringify(subscribers, null, 2), "utf-8");
        return { success: true, count: subscribers.length };
      }
      return { success: false, error: "Already subscribed" };
    } catch (error) {
      console.error("Failed to write subscriber to disk:", error);
      return { success: false, error: "Database write error occurred." };
    }
  },
};
