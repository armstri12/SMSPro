# Regulatory Service

Owns regulation sources, obligation registry, and applicability evaluation.

## Applicability APIs

- `evaluateApplicabilityForSnapshot`: evaluate an `IntakeSnapshot` against an explicit obligation-version set and jurisdiction metadata.
- `retrieveObligationSetWithExplanations`: return obligation/version payload with associated rules and citations.
- `rerunEvaluationForAuditComparison`: compare baseline vs candidate version sets for historical reproducibility and audit deltas.
