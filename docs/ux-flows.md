# UX Flows

1. Landing → Mulai dokumen.
2. Pilih upload atau paste.
3. Pilih template dan citation style.
4. Parse dan tampilkan progress.
5. Review hanya bagian ambiguity.
6. Edit blok secara langsung atau drag-and-drop struktural.
7. Tampilkan validation report.
8. Export DOCX/DOC.

Gamification bersifat minimal: progress, checklist, dan quality score. Tidak ada leaderboard.

## Visual refresh — 2026-07-15
- Direction: academic workspace with navy ink, mint action color, and amber review state.
- Replaced improvised text icons with a consistent inline SVG logo/icon system.
- Primary action remains visually dominant; secondary actions use low-noise outlines/text.
- Landing navigation now anchors to the feature explanation instead of no-op buttons.
- Responsive layout reflows hero, feature grid, workspace panels, and session controls below 800px.
- Focus-visible outlines, readable muted text, and reduced-motion support are included.

## Tutorial visual dan version tag — 2026-07-15
- Added a visual three-step guide under #cara-kerja for users unfamiliar with technical workflows.
- Added a visible 0.1.0 product version tag in the landing footer.
- Tutorial asset is project-local at public/visuals/how-it-works.svg and includes accessible alternative text.

## Analysis review interaction — 2026-07-15
- Clicking Analisis bahan opens a focused result modal after parsing.
- The modal lists detected issues and provides a clear close action.
- Closing the modal while issues remain highlights affected blocks until manually revised.
- Each block supports inline edit and explicit delete with confirmation in addition to drag reorder.
- Editing a block marks it manual/high-confidence; deleting is recorded through the session undo history.

## Analysis modal visual alignment — 2026-07-15
- Restored the warmer cream/green surface palette for workspace dialogs.
- Redesigned the analysis dialog as a structured panel: status header, explanatory copy, issue rows, and a single clear action.
- Modal backdrop uses restrained green tint and blur to preserve context without competing with the review content.
- Warning rows combine icon, text, border, and amber surface so the state is not color-only.
