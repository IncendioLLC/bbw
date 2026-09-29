#!/usr/bin/env bash

set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
compose=(docker compose --file "${repository_root}/compose.yaml" --project-directory "${repository_root}")

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker CLI is required but was not found." >&2
    exit 2
  fi
  if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon is unavailable. Start Docker Desktop or the Docker daemon." >&2
    exit 2
  fi
}

check_health() {
  "${compose[@]}" exec -T postgres sh -ec \
    'test "$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT count(*) FROM pg_extension WHERE extname = '\''vector'\''")" = "1"'

  curl --fail --silent --show-error \
    "http://127.0.0.1:${MAILPIT_UI_PORT:-8025}/readyz" >/dev/null

  "${compose[@]}" exec -T localstack awslocal s3api list-buckets >/dev/null
  "${compose[@]}" exec -T localstack awslocal sqs list-queues >/dev/null
  "${compose[@]}" exec -T localstack awslocal dynamodb list-tables >/dev/null
  "${compose[@]}" exec -T localstack awslocal events list-event-buses >/dev/null

  echo "Local PostgreSQL/pgvector, Mailpit, and AWS emulators are healthy."
}

case "${1:-}" in
  start)
    require_docker
    "${compose[@]}" config --quiet
    "${compose[@]}" up --detach --wait --wait-timeout 180
    check_health
    ;;
  health)
    require_docker
    check_health
    ;;
  status)
    require_docker
    "${compose[@]}" ps
    ;;
  stop)
    require_docker
    "${compose[@]}" down --remove-orphans
    ;;
  *)
    echo "Usage: scripts/local-services.sh {start|health|status|stop}" >&2
    exit 2
    ;;
esac
