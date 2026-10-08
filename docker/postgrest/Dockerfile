# PostgREST ships as a scratch image (no shell, no HTTP client), so Compose has
# nothing to run a healthcheck with. Add a statically linked busybox purely as a
# probe; the PostgREST server itself is untouched.
FROM postgrest/postgrest:v14.18
COPY --from=busybox:musl /bin/busybox /bin/busybox
