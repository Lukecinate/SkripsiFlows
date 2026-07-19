import { NextRequest, NextResponse } from "next/server";
import { exportPdf } from "../../../../lib/export-pdf";
import type { SkripsiDocument } from "../../../../lib/document-model";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const preferredRegion = "auto";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
} satisfies { api: { bodyParser: { sizeLimit: string } } };

const BLOCK_COUNT_LIMIT = 1000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => Date.now() - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(Date.now());
  rateLimitMap.set(ip, recent);
  return true;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const document = body as SkripsiDocument;

    if (!document || !document.blocks || !Array.isArray(document.blocks)) {
      return NextResponse.json(
        { error: "Invalid document: missing blocks array" },
        { status: 400 }
      );
    }

    if (document.blocks.length > 1000) {
      return NextResponse.json(
        { error: "Document exceeds maximum block limit of 1000" },
        { status: 413 }
      );
    }

    if (!document.title?.trim() || !document.templateId) {
      return NextResponse.json(
        { error: "Document missing required metadata (title, templateId)" },
        { status: 400 }
      );
    }

    const filename = (body as any).filename ?? "skripsiflow-document.pdf";

    const result = await exportPdf(document, filename);

    const headers = new Headers();
    headers.set("Content-Type", result.mimeType);
    headers.set("Content-Disposition", `attachment; filename="${result.filename}"`);
    headers.set("Content-Length", result.data.byteLength.toString());
    headers.set("X-Block-Count", document.blocks.length.toString());
    headers.set("X-Export-Format", "pdf");

    return new NextResponse(result.data, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 }
    );
  }
}
