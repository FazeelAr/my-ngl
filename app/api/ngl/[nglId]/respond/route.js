import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { invalidateCacheByPrefix } from "@/lib/cache";
import { hasLengthInRange, normalizeText } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const supabase = getSupabase();
    const { nglId } = await params;
    const body = await request.json();
    const message = normalizeText(body?.message);
    const responder_name = normalizeText(body?.responder_name);

    if (!message) {
      return NextResponse.json({ detail: "Message is required" }, { status: 400 });
    }

    if (!hasLengthInRange(message, 1, 1200)) {
      return NextResponse.json({ detail: "Message must be between 1 and 1200 characters" }, { status: 400 });
    }

    const { data: ngl, error: nglError } = await supabase
      .from("ngls")
      .select("id, is_anonymous")
      .eq("id", nglId)
      .maybeSingle();

    if (nglError) {
      return NextResponse.json({ detail: nglError.message }, { status: 400 });
    }

    if (!ngl) {
      return NextResponse.json({ detail: "NGL not found" }, { status: 404 });
    }

    if (!ngl.is_anonymous && !responder_name) {
      return NextResponse.json({ detail: "Name required for non-anonymous NGL" }, { status: 400 });
    }

    if (responder_name && !hasLengthInRange(responder_name, 2, 60)) {
      return NextResponse.json({ detail: "Responder name must be between 2 and 60 characters" }, { status: 400 });
    }

    const responseId = randomUUID();
    const createdAt = new Date().toISOString();

    const payload = {
      id: responseId,
      ngl_id: nglId,
      message,
      responder_name: ngl.is_anonymous ? null : responder_name,
      created_at: createdAt,
    };

    const { error: insertError } = await supabase.from("responses").insert(payload);

    if (insertError) {
      return NextResponse.json({ detail: insertError.message }, { status: 400 });
    }

    invalidateCacheByPrefix(`responses:${nglId}`);

    return NextResponse.json({
      response_id: responseId,
      message,
      responder_name: payload.responder_name,
    });
  } catch (error) {
    return NextResponse.json({ detail: error.message || "Failed to submit response" }, { status: 400 });
  }
}
