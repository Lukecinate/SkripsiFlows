# Security and Privacy

- Validate extension, MIME, size, encoding, and content at input boundaries.
- Sanitize markup and block path traversal for future server uploads.
- Do not put document content, raw references, pasted text, or generated files in logs.
- Current session persistence is browser-only localStorage with a versioned key.
- Snapshots expire after 60 minutes, are capped at 4 MB, and malformed/expired values are deleted.
- Paste content is capped at 2 MB; undo history is capped at 30 states and is not persisted.
- Export filenames are normalized and limited to prevent unsafe download names.
- OOXML text is XML-escaped before insertion.
- No unsafe HTML sink, dynamic execution, shell execution, or committed secret pattern was found in the latest static scan.
- AI or external metadata providers must not be used without explicit provider privacy guarantees.

## Dependency Advisory
`npm audit --omit=dev` reports two moderate PostCSS advisories transitively related to Next. Automatic remediation requires a breaking downgrade, so `npm audit fix --force` is not used. A compatible patched upgrade is tracked in `doc-nexts/next-task.md`.
