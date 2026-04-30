export type ChatMode = "interview" | "roast" | "vision";

export type ChatHistoryItem = { role: "user" | "assistant"; content: string };
type ChatApiResponse = { success: boolean; reply?: string; error?: string };

const DEFAULT_API_URL = "http://localhost:8000";

function getApiUrl() {
  const v = import.meta.env.VITE_API_URL;
  return typeof v === "string" && v.length > 0 ? v : DEFAULT_API_URL;
}

export async function sendChat(params: {
  message: string;
  mode: ChatMode;
  history: ChatHistoryItem[];
  turnstileToken?: string | null;
  signal?: AbortSignal;
}): Promise<string> {
  const apiUrl = getApiUrl();
  const finalUrl = `${apiUrl}/chat`;
  console.log("[FutureYou] Chat API URL:", finalUrl);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (params.turnstileToken) headers["X-Turnstile-Token"] = params.turnstileToken;
  try {
    const res = await fetch(finalUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(params),
      signal: params.signal,
    });

    let data: ChatApiResponse | null = null;
    try {
      data = (await res.json()) as ChatApiResponse;
    } catch (jsonErr) {
      console.error("[FutureYou] Failed to parse /chat JSON:", jsonErr);
    }

    if (!res.ok) {
      const apiError = data?.error || `${res.status} ${res.statusText}`;
      throw new Error(`Backend error: ${apiError}`);
    }

    if (!data || data.success !== true || typeof data.reply !== "string") {
      throw new Error(data?.error || "Invalid response payload from backend.");
    }

    return data.reply;
  } catch (err) {
    console.error("[FutureYou] sendChat failed:", err);
    throw err;
  }
}

