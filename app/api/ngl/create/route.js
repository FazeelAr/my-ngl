import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { getBearerToken, verifyToken } from "@/lib/auth";
import { invalidateCacheByPrefix } from "@/lib/cache";
import { hasLengthInRange, normalizeText } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const supabase = getSupabase();
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ detail: "Missing authorization header" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ detail: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const question = normalizeText(body?.question);
    const { is_anonymous } = body;

    if (!question || typeof is_anonymous !== "boolean") {
      return NextResponse.json({ detail: "question and is_anonymous are required" }, { status: 400 });
    }

    if (!hasLengthInRange(question, 3, 240)) {
      return NextResponse.json({ detail: "Question must be between 3 and 240 characters" }, { status: 400 });
    }

    const nglId = randomUUID().slice(0, 8);

    const { error } = await supabase.from("ngls").insert({
      id: nglId,
      creator_id: payload.user_id,
      question,
      is_anonymous,
      created_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ detail: error.message }, { status: 400 });
    }

    invalidateCacheByPrefix(`user-ngls:${payload.user_id}`);

    return NextResponse.json({ ngl_id: nglId, question, is_anonymous });
  } catch (error) {
    return NextResponse.json({ detail: error.message || "Failed to create NGL" }, { status: 400 });
  }
}
