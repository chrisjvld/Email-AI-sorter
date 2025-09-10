import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchRecentMessages, parseMessage } from "@/lib/gmail/fetch";
import { classifyAndExtract } from "@/lib/ai/classify_extract";
import { sendLeadNotification } from "@/lib/notifications/webhooks";

export async function POST() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("id, access_token")
    .eq("user_id", data.user.id)
    .eq("provider", "google")
    .single();

  if (!account?.access_token) {
    return NextResponse.json({ error: "no_google_account" }, { status: 400 });
  }

  const messages = await fetchRecentMessages(account.access_token);

  for (const m of messages) {
    const parsed = parseMessage(m.payload);
    const classification = await classifyAndExtract({
      subject: parsed.subject,
      from: parsed.from,
      to: parsed.to,
      cc: parsed.cc,
      snippet: m.snippet,
      bodyText: parsed.bodyText,
    });

    const { data: insertedEmail } = await supabase
      .from("emails")
      .upsert(
        {
          user_id: data.user.id,
          account_id: account.id,
          gmail_id: m.id,
          thread_id: m.threadId || null,
          subject: parsed.subject,
          sender: parsed.from,
          recipient_to: parsed.to,
          recipient_cc: parsed.cc,
          snippet: m.snippet || null,
          body_text: parsed.bodyText,
          body_html: parsed.bodyHtml,
          category: classification.category,
          processed: true,
          received_at: new Date().toISOString(),
        },
        { onConflict: "gmail_id" }
      )
      .select()
      .single();

    if (insertedEmail && classification.category === "lead" && classification.lead) {
      await supabase
        .from("leads")
        .upsert(
          {
            user_id: data.user.id,
            email_id: insertedEmail.id,
            name: classification.lead.name || null,
            email: classification.lead.email || null,
            company: classification.lead.company || null,
            budget: classification.lead.budget || null,
            meeting_link: classification.lead.meeting_link || null,
            confidence: classification.confidence || 0.7,
          },
          { onConflict: "email_id" }
        );

      await sendLeadNotification({
        name: classification.lead.name,
        email: classification.lead.email,
        company: classification.lead.company,
        budget: classification.lead.budget,
        meeting_link: classification.lead.meeting_link,
        confidence: classification.confidence,
      });
    }
  }

  return NextResponse.json({ ok: true, imported: messages.length });
}


