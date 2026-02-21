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

## Quick start

1. Verify API contract YAML parses:

   ```bash
   npm run lint:contracts
   ```

2. Verify baseline migration exists:

   ```bash
   npm run check:schema
   ```

3. Apply baseline schema to PostgreSQL:

   ```bash
   export DATABASE_URL='postgresql://user:pass@localhost:5432/smspro'
   psql "$DATABASE_URL" -f backend/database/migrations/0001_baseline.sql
   ```

## Notes

- This commit focuses on module boundaries, contracts, and schema scaffolding for Phase 1.
- Implementation code for service handlers and front-end views can be added independently in each package.
