# Phase 1 Exit Checklist + Phase 2 Sprint-0 Plan

This plan converts the existing high-level roadmap into an execution checklist that can be used for sign-off and handoff.

## 1) Phase 1 exit checklist (go/no-go)

A Phase 1 exit is complete only when all gates below are marked ✅.

### A. Product and design sign-off

- [ ] Finalize and approve design tokens (color, spacing, typography, states).
- [ ] Approve dashboard layout blueprint for desktop and tablet breakpoints.
- [ ] Accessibility baseline review completed (keyboard navigation, focus order, contrast).
- [ ] UI consistency review completed for sidebar, topbar, cards, and operational tables.

**Evidence required**
- Signed design review notes.
- Updated design references in `frontend/web` package docs.

### B. Scope lock and content lock

- [ ] Lock initial jurisdictions and industries for MVP obligation library.
- [ ] Freeze the MVP questionnaire bank and branching decision table.
- [ ] Confirm top 5 auto-generated program definitions and mandatory sections.

**Evidence required**
- Versioned obligation set selection decision.
- Questionnaire and branching matrix release tag.
- Program catalog version tag.

### C. Functional acceptance criteria verification

- [ ] Intake output reproducibility validated using historical snapshots.
- [ ] Generated program sections include source obligations/citations.
- [ ] Safety records traceability validated to obligations and evidence artifacts.
- [ ] KPI dashboard load performance validated against SLA target.
- [ ] Accessibility/design audit sign-off completed.

**Evidence required**
- Test report and traceability matrix.
- Signed UAT checklist.

### D. Operational readiness

- [ ] Baseline SQL migration applied and verified in staging.
- [ ] Contract linting and schema checks integrated into CI and passing.
- [ ] API endpoint smoke test pack available for intake/regulatory/programs/operations/insights.
- [ ] Export pack workflow tested end-to-end in staging.

**Release decision**
- If any gate above is incomplete, Phase 1 remains in hardening and no formal closure is declared.

---

## 2) Phase 2 Sprint-0 plan (2 weeks)

Sprint-0 objective: prepare execution-ready backlog and architecture for Phase 2 without committing to full feature delivery.

### Week 1: Discovery + architecture definition

1. **Inspections/audits and training matrix definition**
   - Define core entities, lifecycle states, and minimal APIs.
   - Draft OpenAPI contract extensions for inspections, findings, and training records.
2. **Workflow automation and escalations architecture**
   - Define rule triggers, escalation targets, notification channels, and retry semantics.
   - Create first event taxonomy and idempotency strategy.
3. **Analytics enhancement framing**
   - Identify Phase 2 trend analytics KPIs.
   - Define chart data contracts and query latency targets.

### Week 2: Backlog shaping + delivery readiness

1. **Document lifecycle enhancement design**
   - Define revision acknowledgements (who, when, evidence format).
   - Add lifecycle transitions and audit trail requirements.
2. **Prioritized implementation backlog**
   - Break Phase 2 into epics, stories, and acceptance criteria.
   - Assign MoSCoW priority and dependency graph.
3. **Execution readiness gates**
   - Estimate capacity by squad.
   - Confirm test strategy for new APIs and UI flows.
   - Define rollout plan (feature flags, migration sequencing, release milestones).

---

## 3) Sprint-0 deliverables

By end of Sprint-0, the team should publish:

1. A signed Phase 1 closure memo with checklist evidence links.
2. Phase 2 architecture decision record (ADR set).
3. OpenAPI draft updates for inspections/training/automation/lifecycle deltas.
4. Prioritized and estimated Phase 2 backlog for Sprint 1 kickoff.
5. Updated risk register with mitigations and owner assignments.

---

## 4) Suggested owners (adjust as needed)

- **Product/Compliance**: scope lock, obligation library, questionnaire governance.
- **Design/Frontend**: UI accessibility and consistency closure, dashboard blueprint.
- **Backend**: contract updates, workflow/event architecture, lifecycle API expansions.
- **QA/Release**: traceability verification, SLA validation, end-to-end export smoke tests.
- **Engineering Manager**: Sprint-0 planning cadence, dependency/risk burn-down, go/no-go facilitation.

---

## 5) Risks and mitigations

- **Risk:** Scope creep while closing Phase 1.
  - **Mitigation:** enforce go/no-go checklist; defer net-new asks to Phase 2 backlog.
- **Risk:** Regulatory content churn invalidates obligation snapshots.
  - **Mitigation:** strict version pinning and audit-comparison runbook.
- **Risk:** Analytics requirements outpace data model readiness.
  - **Mitigation:** freeze KPI v1 contracts in Sprint-0 and phase chart expansion.
- **Risk:** Lifecycle changes create approval bottlenecks.
  - **Mitigation:** model role-based approval paths and escalation SLAs early.

---

## 6) Immediate next actions (this week)

1. Review this plan with Product, Compliance, and Engineering.
2. Confirm owners and due dates for each Phase 1 exit gate.
3. Start Phase 1 evidence collection in a shared release checklist.
4. Schedule Sprint-0 kickoff and architecture workshops.

---

## 7) Runnable/testable bridge plan (Phase 1 close-out backlog)

Use this sequence to move from scaffolded modules to an environment that can be run and validated end-to-end.

### P0 (must complete to declare “runnable MVP slice”)

1. **Monorepo toolchain + shared scripts**
   - Add root scripts for `build`, `typecheck`, `test`, and `dev` orchestration.
   - Standardize TypeScript config and lint config across all workspace packages.
   - **Done when:** a single root command can execute all package-level checks.

2. **Backend service bootstraps (all Phase 1 modules)**
   - Add minimal HTTP servers for intake/regulatory/programs/operations/insights with `/health` endpoints.
   - Wire each server to handlers already represented by module boundaries.
   - **Done when:** each service starts locally and returns 200 for `/health`.

3. **Local dependency stack**
   - Add `docker-compose.yml` for PostgreSQL (and optional Redis if needed for jobs).
   - Add seed/reset scripts for local developer data.
   - **Done when:** a fresh clone can create DB + apply schema with one documented command path.

4. **Phase 1 contract conformance tests**
   - Implement API smoke tests that hit endpoint stubs against `backend/contracts/phase1/openapi.yaml`.
   - Validate request/response shapes for at least one happy-path operation per service.
   - **Done when:** CI executes smoke tests and publishes pass/fail status.

5. **Dashboard shell runtime wiring**
   - Add a runnable front-end dev server and connect to local service endpoints.
   - Implement mocked fallback mode so UI can run before full backend completion.
   - **Done when:** dashboard page loads and renders health/status cards from live or mocked data.

### P1 (complete immediately after P0 for testability confidence)

1. **Seeded demo scenario**
   - Provide one end-to-end demo tenant with questionnaire answers, obligations, generated program, incident, and KPI data.
   - **Done when:** team can run a single script and view complete demo flow.

2. **End-to-end sanity path**
   - Automate: Intake submission → Applicability result → Program generation → Incident + corrective action → Insights read.
   - **Done when:** one command runs this path in CI and locally.

3. **Release checklist automation**
   - Convert Phase 1 exit evidence into machine-verifiable checks where possible (contract lint, schema verify, smoke tests, basic SLA probe).
   - **Done when:** release candidate build produces a checklist artifact with links to logs/reports.

### Suggested execution order (10 working days)

- **Days 1-2:** P0.1, P0.3
- **Days 3-5:** P0.2
- **Days 6-7:** P0.4
- **Days 8-9:** P0.5 + P1.1
- **Day 10:** P1.2 + P1.3 and Phase 1 closure evidence review

### Minimum command surface to target by end of Phase 1

```bash
npm run dev
npm run build
npm run typecheck
npm run test
npm run test:smoke
npm run test:e2e
```

If these commands are stable on a clean machine (plus DB bring-up), Phase 1 is in a practical run/test-ready state.
