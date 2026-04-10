import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { createToken, verifyPassword } from "@/lib/auth";
import { isValidEmail, normalizeText } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const email = normalizeText(body?.email).toLowerCase();
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ detail: "Invalid email format" }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, username, password")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ detail: error.message }, { status: 400 });
    }

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
    }

    const token = createToken(user.id, user.email);
    return NextResponse.json({
      token,
      user_id: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    return NextResponse.json({ detail: error.message || "Login failed" }, { status: 400 });
  }
}
