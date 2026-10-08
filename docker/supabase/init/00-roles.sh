#!/bin/sh
# The `supabase/postgres` image creates the `supabase_auth_admin`, `authenticator`
# and `supabase_storage_admin` roles WITHOUT passwords (only `postgres` and
# `supabase_admin` get one from POSTGRES_PASSWORD). GoTrue and PostgREST connect
# over TCP with that password, so set it here.
#
# This runs during the database's first initialisation, after the image's own
# init scripts (the entrypoint processes /docker-entrypoint-initdb.d in name order
# and "migrate.sh" sorts before "zzz-roles.sh").

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL || exit 1
alter role supabase_auth_admin with password '${POSTGRES_PASSWORD}';
alter role authenticator with password '${POSTGRES_PASSWORD}';
alter role supabase_storage_admin with password '${POSTGRES_PASSWORD}';
SQL

echo "==> role passwords set for supabase_auth_admin, authenticator, supabase_storage_admin"
