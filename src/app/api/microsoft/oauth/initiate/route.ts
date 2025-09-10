import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { getMicrosoftAuthUrl } from "@/lib/microsoft/oauth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL("/login", process.env.APP_URL || "http://localhost:3000"));
  const state = crypto.randomBytes(16).toString("hex");
  const cookieStore = cookies();
  cookieStore.set({ name: "ms_state", value: state, httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });
  const url = getMicrosoftAuthUrl(state);
  return NextResponse.redirect(url);
}


