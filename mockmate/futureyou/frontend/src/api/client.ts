export type ChatMode = "interview" | "roast" | "vision";

export type ChatHistoryItem = { role: "user" | "assistant"; content: string };

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
  const finalUrl = `${apiUrl}/api/chat`;
  console.log("[FutureYou] Chat API URL:", finalUrl);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (params.turnstileToken) headers["X-Turnstile-Token"] = params.turnstileToken;
  const res = await fetch(finalUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
    signal: params.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Backend error (${res.status}): ${text || res.statusText}`);
  }

  const data = (await res.json()) as { response: string };
  return data.response;
}

