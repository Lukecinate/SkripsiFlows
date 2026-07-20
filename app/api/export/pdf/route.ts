import { NextRequest, NextResponse } from "next/server";
import { exportPdf } from "../../../../lib/export-pdf";
import { checkRateLimit, getClientIp } from "../../../../lib/rate-limit";
import type { SkripsiDocument } from "../../../../lib/document-model";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const preferredRegion = "auto";

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Payload too large" },
      { status: 413 }
    );
  }

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
