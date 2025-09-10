import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function pushToAirtable(record: { name?: string | null; email?: string | null; company?: string | null; budget?: string | null; meeting_link?: string | null; }) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME || "Leads";
  const token = process.env.AIRTABLE_TOKEN;
  if (!baseId || !token) return;
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ records: [{ fields: {
      Name: record.name || '',
      Email: record.email || '',
      Company: record.company || '',
      Budget: record.budget || '',
      MeetingLink: record.meeting_link || '',
    } }] })
  });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const { leadId } = body as { leadId: number };

  const { data: lead } = await supabase
    .from('leads')
    .select('id, name, email, company, budget, meeting_link')
    .eq('id', leadId)
    .eq('user_id', data.user.id)
    .single();

  if (!lead) return NextResponse.json({ error: 'lead_not_found' }, { status: 404 });

  await pushToAirtable(lead);
  return NextResponse.json({ ok: true });
}


