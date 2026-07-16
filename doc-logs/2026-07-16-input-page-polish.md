# Change Log

## 2026-07-16 — Input Page Polish
- Category: ui, ux

### Input page redesign
- Replaced single-column centered layout with two-column layout: info panel (left) + form (right).
- Info panel includes: eyebrow "LANGKAH 01 / 02", serif title "Masukkan bahanmu.", explanatory copy, and a 3-step numbered list showing what happens next (Upload or paste → Review struktur → Unduh dokumen).
- The current step (01) is highlighted with mint accent and badge color swap.
- Privacy note moved to info panel where it has room.
- Added "Kembali ke beranda" secondary button in header for easier navigation back to landing.

### Dropzone polish
- Increased min-height from 175px to 220px with proper padding (32px 24px).
- Larger upload icon (54px container) and stronger headline typography (16px/800).
- Added file-type chips (MD / MARKDOWN / TXT) under the dropzone so users know exactly what's accepted.
- Hover state: border becomes mint accent with subtle background tint.
- Border upgraded from 1px to 2px dashed for stronger visual presence.

### Form panel
- Wrapped form in a surface card with 16px radius and elevated shadow.
- Textarea upgraded to Georgia serif, larger min-height (160px), focus state with mint border.
- "Mulai Edit" button height increased to 50px with better contrast.
- Error message styled as proper alert with amber background.

### Responsive
- On < 800px: stack columns, reduce form padding.

### Documentation
- Updated doc-nexts/current-state.md with input page redesign note.
