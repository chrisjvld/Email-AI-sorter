export async function fetchRecentMicrosoftMessages(accessToken: string) {
  const res = await fetch('https://graph.microsoft.com/v1.0/me/messages?$top=25', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('graph_fetch_failed');
  const json = await res.json();
  const items = json.value || [];
  return items.map((m: any) => ({
    id: m.id as string,
    subject: m.subject as string,
    from: m.from?.emailAddress?.address as string,
    bodyPreview: m.bodyPreview as string,
    receivedDateTime: m.receivedDateTime as string,
    body: m.body?.content || '',
  }));
}


