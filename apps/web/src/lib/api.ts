const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiOptions = RequestInit & {
  token?: string;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "请求失败，请稍后重试",
    }));

    throw new Error(error.message ?? "请求失败，请稍后重试");
  }

  return response.json() as Promise<T>;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export type ApiUser = {
  id: string;
  nickname: string;
  email?: string | null;
};

export type MockLoginResponse = {
  token: string;
  user: ApiUser;
};

export function mockLogin() {
  return apiFetch<MockLoginResponse>("/auth/mock-login", {
    method: "POST",
    body: JSON.stringify({
      nickname: "LinkU 体验用户",
      school: "同济大学",
      city: "上海",
      email: "demo@linku.local",
    }),
  });
}

export type ApiRecommendationItem = {
  card: {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    tags: unknown;
    priceMin?: number | null;
    priceMax?: number | null;
    schedule: unknown;
    onlineMode: "ONLINE" | "OFFLINE" | "HYBRID";
    zone: {
      code: "TUTORING" | "BUDDY" | "PREMIUM";
    };
    user: {
      nickname: string;
      profile?: {
        school: string;
        city: string;
        major?: string | null;
        grade?: string | null;
        verifiedStatus: "UNVERIFIED" | "STUDENT_VERIFIED" | "PROVIDER_VERIFIED";
      } | null;
    };
  };
  score: number;
  matchedFactors: string[];
  reason: string;
};

export type RecommendationsResponse = {
  items: ApiRecommendationItem[];
};

export function getRecommendations(token: string, zone = "tutoring") {
  return apiFetch<RecommendationsResponse>(`/recommendations?zone=${zone}&limit=10`, {
    token,
  });
}

export type SwipeResponse = {
  swipe: unknown;
  match?: {
    id: string;
    matchReason?: string | null;
  } | null;
  hint?: string;
};

export function createSwipe(token: string, targetCardId: string, direction: "left" | "right") {
  return apiFetch<SwipeResponse>("/swipes", {
    method: "POST",
    token,
    body: JSON.stringify({
      targetCardId,
      direction,
    }),
  });
}

export function createContactRequest(token: string, matchId: string, message: string) {
  return apiFetch<unknown>("/contact-requests", {
    method: "POST",
    token,
    body: JSON.stringify({
      matchId,
      message,
    }),
  });
}
