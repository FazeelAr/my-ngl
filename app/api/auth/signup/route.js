import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { createToken, hashPassword } from "@/lib/auth";
import { hasLengthInRange, isValidEmail, normalizeText } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const email = normalizeText(body?.email).toLowerCase();
    const password = typeof body?.password === "string" ? body.password : "";
    const username = normalizeText(body?.username);

    if (!email || !password || !username) {
      return NextResponse.json({ detail: "All fields are required" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ detail: "Invalid email format" }, { status: 400 });
    }

    if (!hasLengthInRange(password, 8, 128)) {
      return NextResponse.json({ detail: "Password must be between 8 and 128 characters" }, { status: 400 });
    }

    if (!hasLengthInRange(username, 2, 40)) {
      return NextResponse.json({ detail: "Username must be between 2 and 40 characters" }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ detail: existingError.message }, { status: 400 });
    }

    if (existing) {
      return NextResponse.json({ detail: "Email already registered" }, { status: 400 });
    }

    const userId = randomUUID();
    const hashedPassword = await hashPassword(password);
    const createdAt = new Date().toISOString();

    const { error: insertError } = await supabase.from("users").insert({
      id: userId,
      email,
      username,
      password: hashedPassword,
      created_at: createdAt,
    });

    if (insertError) {
      return NextResponse.json({ detail: insertError.message }, { status: 400 });
    }

    const token = createToken(userId, email);
    return NextResponse.json({ token, user_id: userId, email, username });
  } catch (error) {
    return NextResponse.json({ detail: error.message || "Signup failed" }, { status: 400 });
  }
}
