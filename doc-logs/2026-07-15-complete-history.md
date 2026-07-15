
## PDF export migration
- Added lib/export-pdf.ts with pagination, heading sizes, tables, and inline bold/italic/underline.
- Workspace primary action changed from DOCX to PDF.
- PDF export remains available at any quality score, including 0/100.
- Added regression test for PDF signature and low-quality export.

## Safe error handling
- Added route/global error pages, centralized safe error mapping, and version-aligned health response.
- Error UI intentionally hides stack traces, document contents, internal paths, and backend/frontend implementation details.
