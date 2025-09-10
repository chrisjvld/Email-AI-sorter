import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchRecentMicrosoftMessages } from "@/lib/microsoft/graph";
import { classifyAndExtract } from "@/lib/ai/classify_extract";
import { sendLeadNotification } from "@/lib/notifications/webhooks";

export async function POST() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: account } = await supabase
    .from('accounts')
    .select('id, access_token')
    .eq('user_id', data.user.id)
    .eq('provider', 'microsoft')
    .single();

  if (!account?.access_token) return NextResponse.json({ error: 'no_ms_account' }, { status: 400 });

  const items = await fetchRecentMicrosoftMessages(account.access_token);
  for (const m of items) {
    const classification = await classifyAndExtract({ subject: m.subject, from: m.from, bodyText: m.body });

    const { data: insertedEmail } = await supabase
      .from('emails')
      .upsert(
        {
          user_id: data.user.id,
          account_id: account.id,
          gmail_id: null,
          thread_id: null,
          subject: m.subject,
          sender: m.from,
          snippet: m.bodyPreview,
          body_text: m.body,
          category: classification.category,
          processed: true,
          received_at: m.receivedDateTime,
        }
      )
      .select()
      .single();

    if (insertedEmail && classification.category === 'lead' && classification.lead) {
      await supabase
        .from('leads')
        .upsert({
          user_id: data.user.id,
          email_id: insertedEmail.id,
          name: classification.lead.name || null,
          email: classification.lead.email || null,
          company: classification.lead.company || null,
          budget: classification.lead.budget || null,
          meeting_link: classification.lead.meeting_link || null,
          confidence: classification.confidence || 0.7,
        });
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

  return NextResponse.json({ ok: true, imported: items.length });
}


