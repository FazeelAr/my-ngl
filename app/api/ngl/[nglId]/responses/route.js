import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getOrSetCache } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const supabase = getSupabase();
    const { nglId } = await params;

    const cacheKey = `responses:${nglId}`;
    const data = await getOrSetCache(cacheKey, 4_000, async () => {
      const { data: rows, error } = await supabase
        .from("responses")
        .select("*")
        .eq("ngl_id", nglId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return rows || [];
    });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=4, stale-while-revalidate=20",
      },
    });
  } catch (error) {
    return NextResponse.json({ detail: error.message || "Failed to fetch responses" }, { status: 400 });
  }
}
