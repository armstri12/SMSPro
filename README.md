# SMSPro

Monorepo scaffold for the SMSPro MVP described in `docs/smspro-e2e-scope-and-design.md`.

## Repository layout

- `backend/intake` – Intake questionnaire and snapshot service.
- `backend/regulatory` – Applicability engine and obligation registry.
- `backend/programs` – Program generation and document lifecycle.
- `backend/operations` – Incidents and corrective actions.
- `backend/insights` – Dashboard and export jobs.
- `backend/contracts/phase1/openapi.yaml` – Phase 1 API contract definitions.
- `backend/database/migrations` – SQL migration scaffolding and baseline schema.
- `shared/domain` – Shared domain entities (`Organization`, `Site`, `User`, `Obligation`, `Incident`, `CorrectiveAction`).
- `frontend/web` – Front-end app shell.

## Phase 1 close-out command surface

```bash
npm run dev
npm run build
npm run typecheck
npm run test
npm run test:smoke
npm run test:e2e
```

## Local DB stack

```bash
npm run db:up
npm run db:reset
npm run db:seed
```

Default DB URL used by scripts is `postgresql://smspro:smspro@localhost:5432/smspro`.

## Notes

- `npm run dev` starts all five backend service stubs plus the frontend dashboard server.
- Each backend service exposes `/health` for basic liveness checks.
- `npm run test:smoke` launches service stubs and validates one happy-path endpoint per Phase 1 module against expected response shape.
- `npm run test:e2e` runs the intake → applicability → program generation → incident + corrective action → insights + export sanity flow.
