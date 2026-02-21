#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:=postgresql://smspro:smspro@localhost:5432/smspro}"

psql "$DATABASE_URL" -c 'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;'
psql "$DATABASE_URL" -f backend/database/migrations/0001_baseline.sql

echo "database reset complete"
