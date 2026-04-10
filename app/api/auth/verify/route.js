import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ detail: "Token required" }, { status: 400 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ detail: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ detail: error.message || "Token verification failed" }, { status: 400 });
  }
}
