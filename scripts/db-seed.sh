#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:=postgresql://smspro:smspro@localhost:5432/smspro}"

psql "$DATABASE_URL" <<'SQL'
INSERT INTO organizations (id, legal_name, primary_jurisdiction)
VALUES ('00000000-0000-0000-0000-000000000001', 'Demo Manufacturing Co', 'federal')
ON CONFLICT (id) DO NOTHING;
SQL

echo "seed data applied"
