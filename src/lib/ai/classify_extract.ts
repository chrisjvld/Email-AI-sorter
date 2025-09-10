import OpenAI from "openai";
import { z } from "zod";

export type EmailCategory = "lead" | "client" | "admin" | "spam";

const LeadSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  company: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  meeting_link: z.string().url().optional().nullable(),
});

const OutputSchema = z.object({
  category: z.enum(["lead", "client", "admin", "spam"]),
  lead: LeadSchema.nullable(),
  confidence: z.number().min(0).max(1).optional().default(0.7),
});

const system = `You are a helpful assistant that classifies emails into categories: lead, client, admin, spam.
If the email represents a potential new business opportunity, classify as lead and extract the lead details (name, email, company, budget if mentioned, meeting link if any).`;

export async function classifyAndExtract(input: {
  subject: string;
  from: string;
  to?: string;
  cc?: string;
  snippet?: string;
  bodyText?: string;
}) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const user = JSON.stringify(input);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Classify and extract from this email JSON: ${user}` },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = OutputSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    return { category: "spam" as EmailCategory, lead: null, confidence: 0.5 };
  }
  return parsed.data;
}


