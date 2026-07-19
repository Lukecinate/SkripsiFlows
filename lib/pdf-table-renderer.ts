/**
 * PDF Table Renderer
 * 
 * Renderer untuk tabel dengan grid lines.
 * Dipisah karena merupakan block renderer terbesar (78+ lines).
 * 
 * @module pdf-table-renderer
 */

import type { PDFFont, PDFPage } from "pdf-lib";
import type { DocumentBlock } from "./document-model";
import { sanitizeForPdf } from "./pdf-text-utils";
import { ensurePageSpace, type PageCursor } from "./pdf-page-utils";

// ─── Constants ──────────────────────────────────────────────────────────────

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 113.39;
const MARGIN_TOP = 70.87;
const MARGIN_BOTTOM = 70.87;
const TEXT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - 70.87;
const BODY_LINE = 18;

// ─── Helper ─────────────────────────────────────────────────────────────────

function ensureSpace(
  cursor: PageCursor,
  needed: number,
  fonts: Record<string, PDFFont>,
  pageLabel: string | null
): PageCursor {
  return ensurePageSpace(
    cursor.pdf, cursor, needed, fonts,
    PAGE_WIDTH, PAGE_HEIGHT, MARGIN_TOP, MARGIN_BOTTOM,
    TEXT_WIDTH, MARGIN_LEFT, pageLabel
  );
}

// ─── Table Renderer ─────────────────────────────────────────────────────────

/**
 * Render tabel dengan grid lines
 * 
 * @param block - Block tipe "table"
 * @param cursor - Posisi cursor saat ini
 * @param fonts - Font yang tersedia
 * @param pageLabel - Label halaman untuk nomor halaman
 * @returns Cursor yang sudah di-update
 */
export function renderTable(
  block: DocumentBlock,
  cursor: PageCursor,
  fonts: Record<string, PDFFont>,
  pageLabel: string
): PageCursor {
  // Caption
  const caption = block.metadata?.tocTitle?.trim() || block.content.split(/\n/)[0]?.replace(/\|/g, " ").trim() || "Tabel";
  const number = block.metadata?.tableNumber ?? "";
  const captionText = number ? `Tabel ${number} ${caption}` : caption;

  cursor = ensureSpace(cursor, BODY_LINE * 2, fonts, pageLabel);
  cursor.page.drawText(sanitizeForPdf(captionText, fonts), {
    x: MARGIN_LEFT,
    y: cursor.y,
    size: 12,
    font: fonts.normal,
  });
  cursor.y -= BODY_LINE;

  // Filter alignment rows (separator antara header dan body)
  const rows = block.content.split(/\n/).filter(Boolean).filter(
    (row, idx) => !(idx === 1 && /^\|?[\s:|-]+\|?$/.test(row.trim()) && row.includes("---"))
  );

  // Render setiap row
  for (const row of rows) {
    cursor = ensureSpace(cursor, BODY_LINE * 1.5, fonts, pageLabel);
    const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
    if (!cells.length) continue;

    const cellWidth = TEXT_WIDTH / cells.length;

    // Garis atas
    cursor.page.drawLine({
      start: { x: MARGIN_LEFT, y: cursor.y + 14 },
      end: { x: MARGIN_LEFT + TEXT_WIDTH, y: cursor.y + 14 },
      thickness: 0.5,
    });

    // Render setiap cell
    let cx = MARGIN_LEFT;
    for (const cell of cells) {
      cursor.page.drawText(sanitizeForPdf(cell, fonts), {
        x: cx + 4,
        y: cursor.y,
        size: 11,
        font: fonts.normal,
      });
      cx += cellWidth;

      // Garis vertikal antar kolom
      cursor.page.drawLine({
        start: { x: cx, y: cursor.y + 16 },
        end: { x: cx, y: cursor.y - 4 },
        thickness: 0.5,
      });
    }

    // Garis bawah
    cursor.page.drawLine({
      start: { x: MARGIN_LEFT, y: cursor.y - 4 },
      end: { x: MARGIN_LEFT + TEXT_WIDTH, y: cursor.y - 4 },
      thickness: 0.5,
    });

    cursor.y -= BODY_LINE;
  }

  cursor.y -= BODY_LINE;
  return cursor;
}
