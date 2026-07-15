# Agent Context

## Mandatory Reading
1. `README.md`
2. `docs/architecture.md`
3. `docs/security-privacy.md`
4. `docs/document-model.md`
5. `docs/testing-quality.md`
6. `doc-nexts/current-state.md`
7. `doc-nexts/next-task.md`
8. `doc-logs/2026-07-15-complete-history.md`

## Non-negotiable Rules
- Documentation is a release artifact, not optional commentary.
- Every code/config change must be reflected in `doc-logs`.
- Update `current-state` and `next-task` when implementation state changes.
- Before every push, fetch and fast-forward pull from `origin/master`.
- Never use force push or destructive reset.
- Never log document content, reference raw input, pasted text, or generated files.
- Do not use unsafe HTML sinks or dynamic code execution.
- Validate all untrusted input at the boundary.
- Keep document model and parser independent from UI.
- Do not invent academic or reference metadata.
- Run tests, build, and `git diff --check` before push.

## Log size guard
- Keep doc-logs/2026-07-15-complete-history.md below 1 MB; never append duplicated full history.
