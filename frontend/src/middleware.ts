import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const isRedisConfigured = redisUrl !== "" && redisToken !== "";

const ratelimit = isRedisConfigured
  ? new Ratelimit({
      redis: new Redis({ url: redisUrl, token: redisToken }),
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "vertex:ratelimit",
    })
  : null;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/subscribe" && ratelimit) {
    try {
      const forwardedFor = request.headers.get("x-forwarded-for");
      const identifier = forwardedFor ? forwardedFor.split(",")[0].trim() : "anonymous";

      const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: "Too many subscription attempts. Please try again later." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          }
        );
      }
    } catch (error) {
      console.warn("Edge rate limiter encountered an exception. Allowing request.", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
