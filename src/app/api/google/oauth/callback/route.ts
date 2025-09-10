import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { createOAuthClient } from "@/lib/google/oauth";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = cookies();
  const originalState = cookieStore.get("g_state")?.value;

  if (!code || !state || !originalState || state !== originalState) {
    return NextResponse.redirect(new URL("/dashboard?error=oauth_state", process.env.APP_URL || "http://localhost:3000"));
  }

  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.redirect(new URL("/login", process.env.APP_URL || "http://localhost:3000"));
  }

  const oauth2 = createOAuthClient();
  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);

  const oauth2api = google.oauth2({ version: "v2", auth: oauth2 });
  const profile = await oauth2api.userinfo.get();
  const emailAddress = profile.data.email || null;

  await supabase
    .from("accounts")
    .upsert({
      user_id: data.user.id,
      provider: "google",
      email_address: emailAddress,
      access_token: tokens.access_token || null,
      refresh_token: tokens.refresh_token || null,
      scope: tokens.scope || null,
      token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return NextResponse.redirect(new URL("/dashboard?connected=google", process.env.APP_URL || "http://localhost:3000"));
}


