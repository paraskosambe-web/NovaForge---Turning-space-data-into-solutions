import { NextResponse } from "next/server";
import { dataset } from "@/lib/data";
import { datasetToCsv } from "@/lib/export";

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get("format") ?? "json";
  if (format === "json") return NextResponse.json(dataset, { headers: { "content-disposition": "attachment; filename=nasa-psi-combustion-investigations.json", "cache-control": "no-store" } });
  if (format === "csv") return new NextResponse(datasetToCsv(dataset), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=nasa-psi-combustion-records.csv", "cache-control": "no-store" } });
  return NextResponse.json({ error: "format must be csv or json" }, { status: 400 });
}
