import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { captureException } from "@sentry/nextjs";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const useRedis = redisUrl !== "" && redisToken !== "";

const redis = useRedis ? new Redis({ url: redisUrl, token: redisToken }) : null;

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
    captureException(error);
    console.error("Failed to initialize database file:", error);
  }
}

initDb();

export const db = {
  getSubscribers: async (): Promise<string[]> => {
    if (useRedis && redis) {
      try {
        const members = await redis.smembers("subscribers");
        return members as string[];
      } catch (error) {
        captureException(error);
        console.error("Redis fetch subscribers failed, falling back to local memory:", error);
      }
    }

    try {
      if (fs.existsSync(dbPath)) {
        const data = fs.readFileSync(dbPath, "utf-8");
        return JSON.parse(data) as string[];
      }
    } catch (error) {
      captureException(error);
    }
    return globalRef.subscribers || [];
  },

  addSubscriber: async (
    email: string
  ): Promise<{ success: boolean; count?: number; error?: string }> => {
    const formattedEmail = email.toLowerCase().trim();

    if (useRedis && redis) {
      try {
        const added = await redis.sadd("subscribers", formattedEmail);
        if (added === 0) {
          return { success: false, error: "Already subscribed" };
        }
        const count = await redis.scard("subscribers");
        return { success: true, count };
      } catch (error) {
        captureException(error);
        console.error("Redis write subscriber failed:", error);
        return { success: false, error: "Database write error occurred." };
      }
    }

    try {
      const subscribers = await db.getSubscribers();
      if (!subscribers.includes(formattedEmail)) {
        subscribers.push(formattedEmail);
        fs.writeFileSync(dbPath, JSON.stringify(subscribers, null, 2), "utf-8");
        globalRef.subscribers = subscribers;
        return { success: true, count: subscribers.length };
      }
      return { success: false, error: "Already subscribed" };
    } catch (error) {
      captureException(error);
      console.error("Failed to write subscriber to disk:", error);
      return { success: false, error: "Database write error occurred." };
    }
  },
};
