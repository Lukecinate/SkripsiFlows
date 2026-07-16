# Change Log

## 2026-07-16 — Workspace Refactor & DOCX Fix
- Category: refactor, export, ux

### Workspace two-panel refactor
- Split workspace into two routes: `/workspace` (input page) and `/workspace/editor` (canonical editor).
- Input page is now a focused upload/paste screen that redirects to editor after parsing.
- Editor uses two-panel layout: StructurePanel (left) + DocumentPreview (right).
- StructurePanel: block navigation with type badges, drag-and-drop reorder, multi-select, inline editing, bulk delete, add block.
- DocumentPreview: WYSIWYG-like rendering with A4 page proportions, template-based font/size/alignment, campus logo placeholder.
- Bidirectional sync: click in structure panel highlights in preview and vice versa; edit in either panel syncs in real-time.
- Extracted 8 components from monolithic 744-line page: StructurePanel, DocumentPreview, CampusLogo, FormatPicker, QualityCheck, AnalysisModal, ConfirmDialog, ReferencePreview.
- Input page and editor page are both under 300 lines; components are all under 130 lines.

### Campus logo placeholder
- Added CampusLogo SVG component as placeholder university logo in document preview header.
- Logo is a simple SVG with "UNIVERSITAS" and "Fakultas Ilmu Komputer" text.

### Format picker
- Added FormatPicker component with PDF (primary) and DOCX (secondary) download options.
- Dropdown menu with click-outside-to-close behavior.

### DOCX export fix
- Rewrote `lib/export-docx.ts` to produce valid OOXML structure.
- Fixed: empty `word/_rels/document.xml.rels` — now includes relationship to styles.xml.
- Fixed: missing `w:tblGrid` in table XML — now includes explicit column definitions.
- Fixed: missing `w:tblBorders` in table properties — now includes full border specification.
- Fixed: missing `w:tblW` and `w:tblStyle` in table properties.
- Fixed: added `w:szCs` (complex script size) alongside `w:sz` in run properties.
- Fixed: added `r` namespace to document.xml for proper relationship resolution.
- Fixed: added `w:header` and `w:footer` and `w:cols` to section properties.
- Added TableGrid style definition in styles.xml.
- Updated DOCX test with assertions for table grid, section properties, and styles relationship.

### CSS additions
- Added editor layout styles (two-column grid, structure panel, document preview).
- Added A4 page container with shadow and proper proportions.
- Added type badge styles for each block type.
- Added campus logo styling.
- Added format picker dropdown styles.
- Added responsive styles for mobile (stack columns vertically below 800px).

### Validation
- 16 tests passing (including new DOCX export assertions).
- `npm run build` passing.
- `git diff --check` passing (CRLF warnings only).
- All new files under 300 lines (taste limit: 400 typical, 800 max).

### Documentation
- Updated `docs/architecture.md` with new routes, data flow, and component list.
- Updated `doc-nexts/current-state.md` with new features and validation baseline.
