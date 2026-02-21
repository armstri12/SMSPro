# Phase 2 Sprint-0 Execution Pack

This document starts Phase 2 execution by turning the planning bullets into implementation-ready artifacts.

## 1) Architecture decisions (initial ADR set)

1. **ADR-P2-001: Operations domain expansion through additive APIs**
   - Add inspections, findings, and training records under additive `/v2/operations/*` endpoints.
   - Preserve Phase 1 endpoint behavior to avoid migration risk.
2. **ADR-P2-002: Workflow automation as rule + event contracts**
   - Add explicit workflow rule resources (`/v2/workflows/rules`).
   - Standardize retry policy and idempotency key template at contract level.
3. **ADR-P2-003: Document lifecycle acknowledgement evidence model**
   - Capture revision acknowledgement as first-class records linked to program documents.
   - Require actor, timestamp, revision number, and evidence type.
4. **ADR-P2-004: Chart/KPI contract-first analytics strategy**
   - KPI evolution remains contract-first with additive data shapes.
   - Latency target for dashboard trend queries: p95 under 1200ms for a single site view.

## 2) Backlog breakdown (Sprint-1 candidate)

| Epic | Story | Priority | Depends on | Acceptance criteria |
| --- | --- | --- | --- | --- |
| Inspections & audits | API for inspection CRUD + status transitions | Must | ADR-P2-001 | Inspectors can schedule, complete, and archive inspections; responses conform to Phase 2 draft schemas. |
| Inspections & audits | Findings linked to inspections and CAPA | Must | ADR-P2-001 | Findings can be created with severity and linked to corrective actions. |
| Training matrix | Training assignment and completion records | Must | ADR-P2-001 | Records support assigned/completed/overdue status and evidence links. |
| Workflow automation | Rule registry + trigger simulation endpoint | Should | ADR-P2-002 | Rules persist trigger, conditions, actions, retry policy, and idempotency template. |
| Workflow automation | Notification channel adapters (email/in-app) | Could | ADR-P2-002 | Triggered rules enqueue notifications with retry metadata. |
| Document lifecycle | Revision acknowledgement API and audit log | Must | ADR-P2-003 | Each acknowledgement captures who/when/evidence and is queryable by document ID. |
| Analytics | Trend KPI data contract implementation | Should | ADR-P2-004 | Trend endpoint returns query-window aggregates and meets p95 SLA target in local perf smoke runs. |

## 3) Execution readiness gates

- **Capacity assumptions:** 2 backend squads, 1 frontend squad, 1 QA/release stream.
- **Test strategy:**
  - Contract validation against `backend/contracts/phase2/openapi-draft.yaml`.
  - Service smoke coverage for at least one happy-path operation per new endpoint family.
  - E2E scenario extension: inspection creation → finding → corrective action → dashboard trend update.
- **Rollout sequencing:**
  1. Ship contracts and feature flags dark.
  2. Deploy read/list endpoints first for non-destructive verification.
  3. Enable write paths for pilot tenants.
  4. Turn on trend analytics cards after data backfill job succeeds.

## 4) Risk register updates

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| Unbounded automation rules create noisy escalations | High | Rule validation and dry-run mode before enablement | Backend lead |
| Training data quality mismatch from external LMS imports | Medium | Introduce import validation profile and quarantine queue | Platform team |
| Inspection/finding volume degrades dashboard latency | Medium | Pre-aggregate trend views and enforce query windows | Insights team |
| Document acknowledgement adoption gaps | Medium | Require acknowledgement in workflow transitions and track completion KPI | Product + Ops |
