import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { exchangeMicrosoftCode } from "@/lib/microsoft/oauth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = cookies();
  const originalState = cookieStore.get("ms_state")?.value;
  if (!code || !state || state !== originalState) {
    return NextResponse.redirect(new URL("/dashboard?error=ms_oauth_state", process.env.APP_URL || "http://localhost:3000"));
  }

  const tokens = await exchangeMicrosoftCode(code);

  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL("/login", process.env.APP_URL || "http://localhost:3000"));

  await supabase
    .from('accounts')
    .upsert({
      user_id: data.user.id,
      provider: 'microsoft',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      scope: tokens.scope || null,
      token_expiry: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return NextResponse.redirect(new URL("/dashboard?connected=microsoft", process.env.APP_URL || "http://localhost:3000"));
}


