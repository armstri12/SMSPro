# Database and Migrations

- `migrations/0001_baseline.sql` contains the baseline schema for MVP entities.
- Apply migrations in lexical order.

Example:

```bash
psql "$DATABASE_URL" -f backend/database/migrations/0001_baseline.sql
```
