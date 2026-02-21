# Intake Service

Owns dynamic questionnaires, deterministic branching logic, intake responses, and immutable snapshots.

## Implemented subsystem capabilities

- Data models for `IntakeQuestion`, `IntakeResponse`, and `IntakeSnapshot`.
- Deterministic branching evaluator that resolves visible questions from prior answers and stores `evaluatedPath` metadata for traceability.
- Service APIs:
  - Start questionnaire session
  - Submit answer batch
  - Finalize snapshot
  - Retrieve historical snapshot + explanation payload
- Snapshot immutability via finalized status locking and monotonically increasing per-site snapshot versions.
- Explainability payload for each derived profile attribute (`whyThisApplies`).

See `src/intakeSubsystem.ts` for implementation details.
