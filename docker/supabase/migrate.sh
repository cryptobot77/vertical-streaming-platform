#!/bin/sh
# Applies the repository's public schema and the sandbox seed, once each.
# Runs as a one-shot compose service after the database and GoTrue are healthy.
set -eu

apply() {
  echo "==> applying $1"
  psql -v ON_ERROR_STOP=1 -f "$1"
}

if [ "$(psql -tAc "select to_regclass('public.series') is not null")" = "t" ]; then
  echo "==> public schema already present, skipping 10-schema.sql"
else
  apply /sql/10-schema.sql
fi

if [ "$(psql -tAc 'select count(*) from public.series')" != "0" ]; then
  echo "==> seed data already present, skipping 20-seed.sql"
else
  apply /sql/20-seed.sql
fi

echo "==> migrations complete"
