import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { getAuthUrl } from "@/lib/google/oauth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.redirect(new URL("/login", process.env.APP_URL || "http://localhost:3000"));
  }
  const state = crypto.randomBytes(16).toString("hex");
  const cookieStore = cookies();
  cookieStore.set({ name: "g_state", value: state, httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 10 });

  const url = getAuthUrl(state);
  return NextResponse.redirect(url);
}


