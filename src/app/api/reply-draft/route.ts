import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { emailContent, calendarLink } = body as { emailContent: string; calendarLink?: string };

  const system = `You write short, friendly, professional reply drafts. Keep it to 4-6 sentences max. If a calendar link is provided, invite them to schedule via that link.`;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Original email:\n${emailContent}\n\nCalendar link: ${calendarLink || "(none)"}\n\nWrite a reply draft.` },
    ],
    temperature: 0.4,
  });

  const reply = completion.choices[0]?.message?.content || "";
  return NextResponse.json({ reply });
}


