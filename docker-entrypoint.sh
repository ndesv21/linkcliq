#!/bin/sh
set -e

needs_volume=false
case "$DATABASE_URL" in file:/app/data/*) needs_volume=true ;; esac
[ -z "$BETTER_AUTH_SECRET" ] && needs_volume=true

if [ "$needs_volume" = true ] && [ ! -w /app/data ]; then
  echo "linkcliq: /app/data is not writable by uid $(id -u). Fix the volume's owner or run the container as root." >&2
  exit 1
fi

# Generate a session secret on first boot and keep it in the data volume,
# so `docker compose up` works without any configuration.
if [ -z "$BETTER_AUTH_SECRET" ]; then
  secret_file=/app/data/.auth-secret
  if [ ! -s "$secret_file" ]; then
    umask 077
    head -c 32 /dev/urandom | base64 > "$secret_file"
  fi
  BETTER_AUTH_SECRET="$(cat "$secret_file")"
  export BETTER_AUTH_SECRET
fi

exec node server.js
