# SMSPro — End-to-End Safety Management System Scope, Plan, and Design Direction

## 1) Product vision
Build a configurable, regulator-aware safety platform that:
- Identifies a site's obligations through a dynamic intake questionnaire.
- Generates required safety programs and regulatory materials from those obligations.
- Tracks operational evidence (training, incidents, inspections, actions) against each obligation.
- Presents all of it in a premium, executive-friendly interface inspired by modern risk dashboards.

---

## 2) Scope (what the product covers)

### A. Regulatory applicability and obligation mapping
- Jurisdiction model (country/state/province/local).
- Regulatory source registry (acts, codes, standards).
- Obligation library (atomic requirements with citations and version history).
- Applicability engine that maps site profile data to an obligation set.

### B. Intake questionnaire and profiling
- Dynamic question sets (industry, headcount, hazards, chemicals, high-risk tasks, contractor use).
- Conditional branching logic to reduce irrelevant questions.
- Explainable outputs: "why this requirement applies".
- Profile snapshots for auditability and re-evaluation.

### C. Program and document generation
- Obligation-to-template mapping to auto-generate:
  - Safety policies
  - Procedures and safe work instructions
  - Forms/checklists/registers
  - Training outlines and competency matrices
- Built-in citation blocks and placeholders for site specifics.
- Approval workflow (draft → review → approved → published).

### D. Safety operations and tracking
- Incident/near-miss management.
- Inspections and audits.
- Corrective/preventive actions (CAPA).
- Training and competency completion.
- Permit workflows (LOTO/hot work/confined space as applicable).
- Evidence links from every record back to obligation/program section.

### E. Monitoring and reporting
- Compliance posture dashboard.
- Overdue and expiring obligation alerts.
- Program revision and acknowledgement tracking.
- Export packs for inspections, leadership, and legal review.

---

## 3) Beautiful design direction (inspired by your reference screenshot)

### Experience principles
- **Dark premium navigation + bright content canvas** for contrast and focus.
- **Card-centric hierarchy** with bold metrics and trend chips.
- **Rounded geometry, soft shadows, subtle borders**, and generous whitespace.
- **Color-coded statuses** that are vivid but controlled (critical, warning, healthy, informational).
- **Executive readability first**: key risk/compliance signals visible in first viewport.

### Layout blueprint
1. **Left Sidebar (persistent)**
   - Brand + site selector at top.
   - Grouped navigation: Main / Operations / System.
   - Active page with elevated highlight and icon accent.
2. **Top Bar**
   - Context greeting (site/business unit).
   - Global search.
   - Notifications + quick actions.
3. **Hero Grid**
   - 4–6 KPI cards (Open Actions, Overdue Obligations, Training Completion, Incident Rate, Audit Score).
   - Trend deltas vs prior period.
4. **Analytical Pane**
   - Risk category radial/stack chart.
   - Compliance trend sparkline.
   - "Last sync" data freshness footer.
5. **Operational Table**
   - Recent compliance tasks, owners, status chips, due dates, and last action.
   - Fast filters and saved views.

### Visual system specification
- **Typography**
  - Headings: clean geometric sans (e.g., Inter/Sora style).
  - Body: neutral sans with high legibility.
- **Color tokens (example)**
  - Sidebar: `#0B1020` → `#121A33` gradient.
  - Canvas: `#F7F9FC`.
  - Surface cards: `#FFFFFF`.
  - Primary accent: `#4F46E5`.
  - Success: `#10B981`, Warning: `#F59E0B`, Critical: `#EF4444`, Info: `#0EA5E9`.
- **Component language**
  - Radius: 14–18px on major cards.
  - Border: 1px low-contrast neutral (`#E5E7EB`).
  - Shadow: soft `0 8px 24px rgba(16,24,40,0.06)`.
  - Chips and badges with subtle filled backgrounds and semibold text.

### Accessibility and usability guardrails
- Minimum 4.5:1 text contrast for all non-decorative text.
- Never encode critical state by color only (pair with labels/icons).
- Keyboard focus ring and skip-navigation behavior.
- Dense-data table modes: Comfortable / Compact.

---

## 4) End-to-end architecture (logical)

### Core services
- **Intake Service**: questionnaires, branching, profile snapshots.
- **Regulatory Intelligence Service**: obligations, sources, versioning, applicability rules.
- **Program Generator Service**: templates, rendering, approvals, publication.
- **Safety Operations Service**: incidents, audits, training, permits, CAPA.
- **Compliance Insights Service**: KPIs, trends, alerts, exports.

### Shared platform capabilities
- Multi-tenant org/site model.
- RBAC (Admin, Safety Manager, Supervisor, Worker, Auditor, Read-only regulator).
- Immutable audit logs and field-level history.
- Notifications (email/in-app/SMS).
- API-first design for integration with HRIS/LMS/CMMS.

---

## 5) Data model (minimum entities)
- `Organization`, `Site`, `Department`, `User`, `RoleAssignment`
- `RegulationSource`, `Obligation`, `ObligationVersion`, `ApplicabilityRule`
- `IntakeQuestion`, `IntakeResponse`, `IntakeSnapshot`
- `ProgramTemplate`, `ProgramDocument`, `ProgramRevision`, `ApprovalStep`
- `Incident`, `Inspection`, `Finding`, `CorrectiveAction`, `TrainingRecord`, `Permit`
- `EvidenceArtifact` (document/photo/signoff/record link)
- `Alert`, `ReportExportJob`

All operational entities should support relation fields to `obligation_id` and `program_document_id` where applicable.

---

## 6) Phased delivery plan

### Phase 1 (MVP, 10–14 weeks)
- Dynamic intake questionnaire + applicability engine.
- Obligation registry with citations and explainability.
- Program generation for top 5 foundational programs.
- Incident + corrective action modules.
- Baseline dashboard and PDF export pack.
- Premium UI shell (sidebar/topbar/KPI cards/table) aligned to the design direction.

### Phase 2 (Scale-up, 8–12 weeks)
- Inspections/audits and training matrix.
- Advanced workflow automation and escalations.
- Trend analytics and richer charting.
- Revision acknowledgements and document lifecycle enhancements.

### Phase 3 (Optimization, 8–12 weeks)
- Rule editor for compliance specialists.
- Integration connectors (HRIS/LMS/CMMS/BI).
- Predictive risk indicators and anomaly detection.
- Multi-jurisdiction benchmarking across sites.

---

## 7) Acceptance criteria
- Intake output is reproducible and explainable for any historical snapshot.
- Every generated program section shows source obligations/citations.
- Every key safety record can be traced to obligations and evidence.
- Dashboard loads key compliance KPIs within agreed SLA.
- UI passes accessibility checks and design consistency audit.

---

## 8) Recommended immediate next actions
1. Approve the design system tokens and dashboard layout blueprint.
2. Lock initial jurisdictions/industries for MVP obligation library.
3. Finalize MVP questionnaire question bank and branching logic.
4. Define "top 5" auto-generated programs for first rollout.
5. Create clickable high-fidelity UI prototype before engineering build.
