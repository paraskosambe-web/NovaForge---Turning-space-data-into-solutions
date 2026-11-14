import { NextResponse } from "next/server";
import { dataset } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(dataset, { headers: { "cache-control": "public, max-age=60, stale-while-revalidate=300" } });
}
