import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import SyncGmailButton from "@/components/SyncGmailButton";
import ConnectGmailButton from "@/components/ConnectGmailButton";
import PushToCRMButton from "@/components/PushToCRMButton";
import ConnectOutlookButton from "@/components/ConnectOutlookButton";
import SyncOutlookButton from "@/components/SyncOutlookButton";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, email, company, budget, meeting_link, confidence, created_at, email_id")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: emails } = await supabase
    .from("emails")
    .select("id, subject, sender, category, received_at")
    .order("received_at", { ascending: false })
    .limit(50);

  const { data: googleAccount } = await supabase
    .from("accounts")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("provider", "google")
    .maybeSingle();

  const { data: msAccount } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('provider', 'microsoft')
    .maybeSingle();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-3">
          {googleAccount ? <SyncGmailButton /> : <ConnectGmailButton />}
          {msAccount ? <SyncOutlookButton /> : <ConnectOutlookButton />}
          <SignOutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-medium mb-3">Leads</h2>
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Company</th>
                  <th className="text-left p-2">Budget</th>
                  <th className="text-left p-2">Meeting</th>
                  <th className="text-left p-2">Confidence</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(leads || []).map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="p-2">{l.name}</td>
                    <td className="p-2">{l.email}</td>
                    <td className="p-2">{l.company}</td>
                    <td className="p-2">{l.budget}</td>
                    <td className="p-2">
                      {l.meeting_link ? (
                        <a className="text-blue-600 hover:underline" href={l.meeting_link} target="_blank" rel="noreferrer">
                          Link
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2">{l.confidence?.toFixed?.(2)}</td>
                    <td className="p-2"><PushToCRMButton leadId={l.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-3">Recent Emails</h2>
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">Subject</th>
                  <th className="text-left p-2">From</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Received</th>
                </tr>
              </thead>
              <tbody>
                {(emails || []).map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="p-2">{e.subject}</td>
                    <td className="p-2">{e.sender}</td>
                    <td className="p-2">{e.category}</td>
                    <td className="p-2">{new Date(e.received_at || '').toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}


