import { google } from "googleapis";

export async function fetchRecentMessages(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({ userId: "me", maxResults: 25, q: "newer_than:30d" });
  const messages = list.data.messages || [];
  const results = [] as Array<{
    id: string;
    threadId: string | undefined;
    payload: any;
    snippet: string | undefined;
  }>;

  for (const m of messages) {
    if (!m.id) continue;
    const msg = await gmail.users.messages.get({ userId: "me", id: m.id, format: "full" });
    results.push({ id: m.id, threadId: msg.data.threadId, payload: msg.data.payload, snippet: msg.data.snippet });
  }

  return results;
}

export function parseMessage(payload: any) {
  const headers = (payload?.headers || []) as Array<{ name: string; value: string }>;
  const getHeader = (n: string) => headers.find((h) => h.name?.toLowerCase() === n.toLowerCase())?.value || "";
  const subject = getHeader("Subject");
  const from = getHeader("From");
  const to = getHeader("To");
  const cc = getHeader("Cc");

  // Flatten body text
  const parts = payload?.parts || [];
  let bodyText = "";
  let bodyHtml = "";
  const stack = [...parts];
  while (stack.length) {
    const p = stack.pop();
    if (!p) continue;
    if (p.parts) stack.push(...p.parts);
    const mimeType = p.mimeType;
    const data = p.body?.data;
    if (data && (mimeType === "text/plain" || mimeType === "text/html")) {
      const decoded = Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
      if (mimeType === "text/plain") bodyText += decoded + "\n";
      if (mimeType === "text/html") bodyHtml += decoded + "\n";
    }
  }

  return { subject, from, to, cc, bodyText: bodyText.trim(), bodyHtml: bodyHtml.trim() };
}


