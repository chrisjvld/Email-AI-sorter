type LeadPayload = {
  name?: string | null;
  email?: string | null;
  company?: string | null;
  budget?: string | null;
  meeting_link?: string | null;
  confidence?: number | null;
};

export async function sendLeadNotification(lead: LeadPayload) {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  const message = `New qualified lead: ${lead.name || "Unknown"} (${lead.email || ""})\nCompany: ${lead.company || "-"}\nBudget: ${lead.budget || "-"}\nConfidence: ${lead.confidence ?? "-"}\nMeeting: ${lead.meeting_link || "-"}`;

  const tasks: Promise<any>[] = [];
  if (slackWebhook) {
    tasks.push(
      fetch(slackWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      })
    );
  }
  if (discordWebhook) {
    tasks.push(
      fetch(discordWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      })
    );
  }

  if (tasks.length) {
    await Promise.allSettled(tasks);
  }
}


