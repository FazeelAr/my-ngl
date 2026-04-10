import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getOrSetCache } from "@/lib/cache";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const supabase = getSupabase();
    const { nglId } = await params;

    const cacheKey = `ngl:${nglId}`;
    const data = await getOrSetCache(cacheKey, 10_000, async () => {
      const { data: row, error } = await supabase
        .from("ngls")
        .select("*")
        .eq("id", nglId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return row;
    });

    if (!data) {
      return NextResponse.json({ detail: "NGL not found" }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    return NextResponse.json({ detail: error.message || "Failed to fetch NGL" }, { status: 400 });
  }
}
