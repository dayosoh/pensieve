/**
 * Pensieve API client — communicates with the Go backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    const body = await res.json();

    if (!res.ok) {
      return { error: body.error || `HTTP ${res.status}` };
    }

    return { data: body as T };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network error" };
  }
}

export const api = {
  postEvent(event: unknown) {
    return request("/events", {
      method: "POST",
      body: JSON.stringify(event),
    });
  },

  listEvents(params?: { limit?: number; offset?: number; type?: string }) {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.offset) qs.set("offset", String(params.offset));
    if (params?.type) qs.set("type", params.type);
    return request<{ events: unknown[]; limit: number; offset: number }>(
      `/events?${qs.toString()}`
    );
  },

  getEvent(id: string) {
    return request(`/events/${id}`);
  },

  sync(payload: unknown) {
    return request("/sync", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
