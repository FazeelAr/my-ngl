import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getBearerToken, verifyToken } from "@/lib/auth";
import { getOrSetCache } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const supabase = getSupabase();
    const { userId } = await params;
    const token = getBearerToken(request);

    if (!token) {
      return NextResponse.json({ detail: "Missing authorization header" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ detail: "Invalid token" }, { status: 401 });
    }

    if (payload.user_id !== userId) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `user-ngls:${userId}`;
    const data = await getOrSetCache(cacheKey, 6_000, async () => {
      const { data: rows, error } = await supabase
        .from("ngls")
        .select("*")
        .eq("creator_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return rows || [];
    });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, max-age=6, stale-while-revalidate=20",
      },
    });
  } catch (error) {
    return NextResponse.json({ detail: error.message || "Failed to fetch NGLs" }, { status: 400 });
  }
}
