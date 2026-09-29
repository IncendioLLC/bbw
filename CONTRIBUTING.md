# Contributing to BBW Stage 1

This is the shortest verified path from a clean checkout to a passing test.
Run commands from the repository root.

## Prerequisites

- Node.js `24.21.0` (the supported range is recorded in `package.json`).
- pnpm `12.6.0`, normally activated through Corepack.
- Docker Desktop or a compatible Docker Engine with Compose, when running
  local infrastructure.
- Git.

Check the runtime before installing:

```sh
node --version
corepack pnpm --version
```

Some Node distributions do not bundle Corepack. In that case, run pnpm through
the pinned bootstrap package:

```sh
npx --yes --package corepack@0.36.0 corepack pnpm --version
```

## Install and run the first test

Install exactly the dependency graph committed in `pnpm-lock.yaml`, then run
the unit suite:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm test:unit
```

Use the `npx ... corepack pnpm` prefix from above for both commands if
`corepack` is unavailable on `PATH`.

## Local services

The platform uses loopback-only PostgreSQL 17 with pgvector, Mailpit, and
LocalStack. No cloud credentials or external email delivery are needed.

```sh
scripts/local-services.sh start
scripts/local-services.sh health
scripts/local-services.sh status
scripts/local-services.sh stop
```

Safe defaults are committed in `.env.example`. Copy only required overrides to
the ignored `.env.local`; never commit real credentials. Endpoints, persistence
behavior, logs, and recovery steps are documented in
[`docs/local-development-services.md`](docs/local-development-services.md).

## Database migrations

The local PostgreSQL container enables pgvector automatically. Application
schema migrations are intentionally not present in the foundation milestone;
they will be added to `packages/database` by the database tasks. Until that
interface exists, do not create ad hoc schemas or claim a migration has run.
Once introduced, its documented migration command will be required after
starting local services and before application tests.

## Verification commands

Use the focused command while developing and run all affected gates before
hand-off:

```sh
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm security:scan
corepack pnpm license:check
corepack pnpm test:e2e
```

Playwright needs its managed browsers once per workstation:

```sh
corepack pnpm exec playwright install chromium firefox webkit
```

The pull-request workflow in `.github/workflows/quality.yml` is the source of
truth for automated quality gates.

## Repository boundaries

- `apps/web` is the public/member surface; `apps/admin` is the separate
  management surface.
- `apps/api` and `apps/worker` contain server and background processing code.
- Reusable contracts and implementation live under `packages`; AWS code lives
  under `infra`.
- `demo/` is a frozen archive. Do not edit, import runtime code from, format, or
  test it as part of the new product.
- `tasks.md` controls execution order. Read `implementation_rules.md` and
  `current_status.md` before claiming work.

## Troubleshooting

- **Wrong Node or pnpm version:** switch to Node `24.21.0`, then use the pinned
  Corepack fallback above. Do not regenerate the lockfile with another pnpm.
- **Frozen install fails:** confirm `package.json` and `pnpm-lock.yaml` are from
  the same revision. Dependency changes must update both deliberately.
- **A local port is occupied:** inspect `5432`, `1025`, `8025`, and `4566`, or
  set a local override based on `.env.example` before starting services.
- **A service is unhealthy:** run `docker compose logs postgres mailpit
localstack`, correct the reported issue, and rerun
  `scripts/local-services.sh health`.
- **Browser tests cannot launch:** install the three Playwright browsers with
  the command above; application dependencies alone do not install them.
- **Generated output causes noise:** do not commit `node_modules`, coverage,
  build output, Turborepo cache, or Playwright artifacts; their ownership and
  cleanup rules are in `GENERATED_FILES.md`.
