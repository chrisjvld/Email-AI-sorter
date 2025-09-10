interface MicrosoftMessage {
  id: string;
  subject: string;
  from: {
    emailAddress: {
      address: string;
    };
  };
  bodyPreview: string;
  receivedDateTime: string;
  body: {
    content: string;
  };
}

export async function fetchRecentMicrosoftMessages(accessToken: string) {
  const res = await fetch('https://graph.microsoft.com/v1.0/me/messages?$top=25', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('graph_fetch_failed');
  const json = await res.json() as { value: MicrosoftMessage[] };
  const items = json.value || [];
  return items.map((m: MicrosoftMessage) => ({
    id: m.id,
    subject: m.subject,
    from: m.from?.emailAddress?.address || '',
    bodyPreview: m.bodyPreview,
    receivedDateTime: m.receivedDateTime,
    body: m.body?.content || '',
  }));
}


