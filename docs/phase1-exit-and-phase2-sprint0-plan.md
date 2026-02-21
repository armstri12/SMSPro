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
