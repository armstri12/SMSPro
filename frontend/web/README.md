# Frontend Web

UI shell for SMSPro dashboards and workflows.

## Program workflow hooks

`src/programDocumentsApi.ts` includes API hooks for:

- Generate/re-generate program documents.
- Submit revisions for review and capture approvals.
- Export PDF packs for inspection, leadership, and legal review.

## Operations + insights dashboard shell (Phase 1)

- `src/operationsApi.ts`: incident/corrective action workflow APIs.
- `src/insightsApi.ts`: KPI summary and Phase 1 compliance PDF export API.
- `src/phase1DashboardShell.ts`: persistent sidebar + top bar + KPI cards + operational table shell with status and due-date indicators.
