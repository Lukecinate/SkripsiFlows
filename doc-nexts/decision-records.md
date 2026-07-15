# Decision Records

## ADR-001: Product name
- Decision: SkripsiFlow.
- Rationale: clear Indonesian audience signal and memorable workflow identity.

## ADR-002: Parsing strategy
- Decision: deterministic-first hybrid.
- Rationale: minimizes silent errors; AI assistance must be bounded and reviewable.

## ADR-003: Session model
- Decision: no account initially; browser-only temporary persistence.
- Rationale: lowers onboarding friction while limiting server exposure.

## ADR-004: Editor interaction
- Decision: structural block drag-and-drop, not granular sentence dragging.
- Rationale: improves organization while reducing accidental content corruption.

## ADR-005: Export safety
- Decision: unresolved review blocks export and output filenames are sanitized.
- Rationale: prevents silent structural defects and filesystem/download edge cases.

## ADR-006: Documentation traceability
- Decision: every commit is mapped to a change log and current/next handoff state.
- Rationale: new agents must be able to continue without reading all repository history.

## ADR-007: Dependency advisory handling
- Decision: do not run `npm audit fix --force` when it causes a breaking framework downgrade.
- Rationale: preserve application compatibility; track a compatible patched upgrade separately.
