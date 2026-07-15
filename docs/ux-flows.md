# UX Flows

1. Landing ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ Mulai dokumen.
2. Pilih upload atau paste.
3. Pilih template dan citation style.
4. Parse dan tampilkan progress.
5. Review hanya bagian ambiguity.
6. Edit blok secara langsung atau drag-and-drop struktural.
7. Tampilkan validation report.
8. Export DOCX/DOC.

Gamification bersifat minimal: progress, checklist, dan quality score. Tidak ada leaderboard.

## Visual refresh ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â 2026-07-15
- Direction: academic workspace with navy ink, mint action color, and amber review state.
- Replaced improvised text icons with a consistent inline SVG logo/icon system.
- Primary action remains visually dominant; secondary actions use low-noise outlines/text.
- Landing navigation now anchors to the feature explanation instead of no-op buttons.
- Responsive layout reflows hero, feature grid, workspace panels, and session controls below 800px.
- Focus-visible outlines, readable muted text, and reduced-motion support are included.

## Tutorial visual dan version tag ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â 2026-07-15
- Added a visual three-step guide under #cara-kerja for users unfamiliar with technical workflows.
- Added a visible 0.1.0 product version tag in the landing footer.
- Tutorial asset is project-local at public/visuals/how-it-works.svg and includes accessible alternative text.

## Analysis review interaction ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â 2026-07-15
- Clicking Analisis bahan opens a focused result modal after parsing.
- The modal lists detected issues and provides a clear close action.
- Closing the modal while issues remain highlights affected blocks until manually revised.
- Each block supports inline edit and explicit delete with confirmation in addition to drag reorder.
- Editing a block marks it manual/high-confidence; deleting is recorded through the session undo history.

## Analysis modal visual alignment ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â 2026-07-15
- Restored the warmer cream/green surface palette for workspace dialogs.
- Redesigned the analysis dialog as a structured panel: status header, explanatory copy, issue rows, and a single clear action.
- Modal backdrop uses restrained green tint and blur to preserve context without competing with the review content.
- Warning rows combine icon, text, border, and amber surface so the state is not color-only.

## Bulk block operations and release version ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â 2026-07-15
- Added per-block checkboxes and Pilih semua for batch workflows.
- Selected blocks can be deleted together; deletion is confirmation-gated and remains undoable.
- Selection state is visually distinct and keyboard-labels are provided.
- Version tag advanced from 0.1.0 to 0.2.0 to reflect the accumulated feature milestone.

## Editable section type ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â 2026-07-15
- Each block now has a type selector.
- Users can convert a paragraph into Subbab/Sub-subbab or another supported structural type.
- Type changes are undoable through the existing session history and are marked as manual verification.

## Drag interaction refinement ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â 2026-07-15
- Dragged blocks lift slightly with a focused shadow and subtle tilt.
- The active drop target moves to reveal an insertion line and mint surface.
- Successful drops receive a short pulse confirmation.
- Drag cleanup runs on drop and drag end to prevent stale visual state.
- Reduced-motion users receive the same structural feedback without animation.

## Export with review warnings Ã¢â‚¬â€ 2026-07-15
- Warning-level findings no longer block DOCX export.
- The quality panel clearly reports Siap diekspor dengan catatan review. when warnings remain.
- Critical validation errors still block export.
- Exporter enforces required metadata rather than rejecting every low-confidence block.

## DOCX download feedback â€” 2026-07-15
- Download anchors are appended to the document before click to support browser save behavior.
- Object URL cleanup is delayed until after the click event is dispatched.
- Export errors are caught and shown as user-facing status.
- Successful downloads show a visible toast telling users to check the browser Downloads folder.
