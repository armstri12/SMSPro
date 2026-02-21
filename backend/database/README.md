# Database and Migrations

- `migrations/0001_baseline.sql` contains the baseline schema for MVP entities.
- Apply migrations in lexical order.

## Local workflow

```bash
npm run db:up
npm run db:reset
npm run db:seed
```

Manual apply example:

```bash
psql "$DATABASE_URL" -f backend/database/migrations/0001_baseline.sql
```
