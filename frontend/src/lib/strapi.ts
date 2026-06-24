// frontend/src/lib/strapi.ts

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "";
const useRealStrapi = strapiUrl !== "";

// local fallback
const fallbackCMS = {
  landingPage: {
    heroTitle: "Public Product Website",
    heroSubtitle:
      "Build a public product website with authentication, CMS-driven content, and a basic dashboard to promote any web application.",
    ctaText: "Start Free Trial",
    useCases: [
      { id: "1", title: "Title 1", description: "Description 1." },
      {
        id: "2",
        title: "Title 2",
        description: "Description 2.",
      },
    ],
  },
  features: [
    {
      id: "1",
      title: "Feature 1",
      description: "Feature description 1.",
    },
    {
      id: "2",
      title: "Feature 2",
      description: "Feature description 2.",
    },
    {
      id: "3",
      title: "Feature 3",
      description: "Feature description 3.",
    },
  ],
  pricing: [
    {
      name: "Starter",
      price: "$0",
      billing: "free",
      features: ["1 Team Member", "1 Tester", "Basic Logs (3-day retention)"],
    },
    {
      name: "Basic",
      price: "$49",
      billing: "per month",
      features: ["10 Team Members", "1 Tester", "Advanced Analytics Dashboard"],
    },
    {
      name: "Enterprise",
      price: "$299",
      billing: "per month",
      features: ["Unlimited Members", "Isolated Cluster Deployments", "1 Solutions Architect"],
    },
  ],
};

function normalizeStrapiData<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    return payload as T;
  }

  const record = payload as Record<string, unknown>;
  if (!record.data) {
    return payload as T;
  }

  const extractAttributes = (item: unknown): unknown => {
    if (item && typeof item === "object") {
      const itemRecord = item as Record<string, unknown>;
      const attributes = itemRecord.attributes;
      if (attributes && typeof attributes === "object") {
        return {
          id: itemRecord.id,
          ...(attributes as Record<string, unknown>),
        };
      }
    }
    return item;
  };

  if (Array.isArray(record.data)) {
    return record.data.map(extractAttributes) as unknown as T;
  }

  return extractAttributes(record.data) as unknown as T;
}

// Strapi query
export async function fetchFromStrapi<T>(
  endpoint: string,
  fallbackKey: keyof typeof fallbackCMS
): Promise<T> {
  if (useRealStrapi) {
    try {
      const response = await fetch(`${strapiUrl}/api/${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const json = (await response.json()) as unknown;
        return normalizeStrapiData<T>(json);
      }
    } catch (error) {
      console.warn(`Strapi fetch failed for /api/${endpoint}. Sourcing from fallback.`, error);
    }
  }

  return fallbackCMS[fallbackKey] as unknown as T;
}
