# Programs Service

Owns program template mapping and document generation workflows.

## Phase 1 foundations implemented

- Top 5 foundational programs are codified in `src/programCatalog.ts`:
  - Safety Policy and Governance
  - Incident Reporting and Investigation
  - Hazard Identification and Risk Assessment
  - Corrective and Preventive Actions (CAPA)
  - Training and Competency Baseline
- Template renderer merges site profile attributes + applicable obligations into each section and appends a citation block.
- Workflow state machine enforces lifecycle transitions: `draft -> review -> approved -> published`.
- Lifecycle service supports generation/re-generation, review/approval decisions, and PDF pack export payload creation.
