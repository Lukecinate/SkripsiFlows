import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ name: "SkripsiFlow", status: "ok", version: "0.2.0" });
}
