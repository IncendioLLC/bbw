# BBW Stage 1 — Current Implementation Status

This is the concise handoff source for agents resuming implementation. It records current truth, not a full history. Read it before `tasks.md`, then inspect only the files relevant to the selected task.

**Last updated:** 2026-09-27  
**Updated through task:** `FND-001` through `FND-014`, `ARC-001` through `ARC-012`, `INF-001` through `INF-014`, `INF-022`  
**Current phase:** Milestone 3 Stage 1 database, ECS services, SES, and OIDC foundations are deployed and verified  
**Task status:** 2 ready, 166 pending, 0 in progress, 0 blocked, 45 complete

## 1. Current objective

Continue Milestone 3 in the single Stage 1 AWS account. Environment isolation through AWS Organizations is deferred to a later milestone under ADR-0001.

## 2. Implementation state

| Area | State | Current truth |
|---|---|---|
| Execution harness | Ready | `tasks.md`, `implementation_rules.md`, `current_status.md`, and `progress.html` exist. The graph contains 213 valid, acyclic tasks. |
| Repository foundation | Complete | All 14 Milestone 1 tasks are verified: workspace/tooling, quality gates, tests, local services, security and license policy, CI, ADRs, and contributor onboarding. |
| Public/member application | Scaffolded | `apps/web` has public/authenticated App Router groups and a no-store `/healthz` endpoint; identity integration remains later work. |
| Management application | Scaffolded | `apps/admin` is independently buildable with management-only navigation and deny-by-default access. |
| API and worker | API and worker scaffolded | `apps/api` has Fastify health/readiness, request IDs, and graceful shutdown; `apps/worker` has lifecycle, structured logging, synthetic job handling, health, and signal shutdown. |
| Database | Not started | No new Drizzle schema or migrations exist outside the archived demo. |
| AWS infrastructure | Stage 1 foundation and integrations deployed | `BbwStage1-stage1` is deployed in `us-east-1`; VPC/NAT/endpoints, security groups, encrypted storage, queues/DLQs, EventBridge schedules, RDS, ECS cluster, scoped roles, GitHub OIDC, SES configuration set, SNS destination, and SQS event capture are live. |
| Authentication and authorization | Not started | Cognito, tenant context, and RLS have not been implemented. |
| AI and curated RAG | Not started | No provider adapter, Knowledge Card pipeline, retrieval, or evaluation implementation exists. |
| Product modules | Not started | Profiles, dashboards, company hub, news, ecosystem, snapshots, and management operations remain unimplemented. |
| Verification and release | Not started | Milestones 1 and 2 are verified; release gates remain for later implementation milestones. |

## 3. Locked architecture and constraints

- TypeScript monorepo using Node 24, pnpm, and Turborepo.
- Separate Next.js public/member and management applications.
- Internal Fastify API and separate background worker.
- One Stage 1 AWS account/environment in `us-east-1`; AWS Organizations account isolation is deferred under ADR-0001 and must be added before production scale-up.
- ECS Fargate, CloudFront, WAF, ALB, private services, NAT egress, SQS/DLQs, SES, and EventBridge.
- RDS PostgreSQL 17 with Drizzle, shared-schema tenant isolation, forced RLS, and pgvector.
- Separate Cognito member and management pools; management MFA is mandatory.
- OpenAI behind a provider adapter; only owner-approved Knowledge Cards and FAQs are retrieved in Stage 1.
- Founder, Service Provider, and VC are member organization types. Management is a separate privileged surface.
- Private company data is shared only through immutable selected-field snapshots with recipient binding, expiry, revocation, optional external OTP, and access logs.
- No arbitrary document ingestion, PHI, confidential scientific data, marketplace payments, advanced matching, or member subscription billing in Stage 1.
- `demo/` is read-only reference material. New product code lives outside it.

## 4. Important interfaces and data changes

- Root package identity: `@bbw/platform`, private version `0.0.0`.
- Runtime/tooling pins: Node `24.21.0`, pnpm `12.6.0`, Turborepo `2.11.4`.
- Workspace globs: `apps/*`, `packages/*`, and `infra` in `pnpm-workspace.yaml`.
- Workspace packages: `@bbw/web`, `@bbw/admin`, `@bbw/api`, `@bbw/worker`, `@bbw/infra`, `@bbw/shared`, `@bbw/config`, `@bbw/database`, `@bbw/ui`, and `@bbw/api-client`.
- Reproducible install: `corepack pnpm install --frozen-lockfile`; on Node distributions without bundled Corepack, invoke the pinned Corepack package through `npx`.
- Shared TypeScript configs: `packages/config/tsconfig/{base,browser,node,test}.json`; root `tsconfig.json` references every workspace.
- ADR template: `docs/adr/0000-template.md`; accepted decisions are superseded by new ADRs rather than rewritten.
- Security gate: `pnpm security:scan`; checks high-confidence credentials, prohibited files, and high-severity dependency vulnerabilities.
- License gate: `pnpm license:check`; `config/license-policy.json` is fail-closed and requires documented approval before expansion.
- Generated artifacts and ownership are documented in `GENERATED_FILES.md` and marked in `.gitattributes`.
- Code quality commands: `pnpm lint` and `pnpm format:check`; archived `demo/`, Word documents, harness snapshots, and build artifacts are excluded deliberately.
- Unit tests: `pnpm test:unit`; named Vitest projects cover browser (`happy-dom`), Node, and runtime-neutral shared code, with reports under `coverage/unit`.
- Browser tests: `pnpm test:e2e`; five Playwright desktop/mobile projects use a deterministic loopback smoke server. New machines install Chromium, Firefox, and WebKit first.
- Environment API: `@bbw/config/environment` exports typed parsers for web, admin, API, worker, and infrastructure; validation errors expose variable names/categories but never values.
- Task orchestration: `turbo.json` defines dependency-aware build, lint, typecheck, unit, integration, e2e, and persistent dev pipelines; root scripts invoke the relevant gates.
- Local services: `scripts/local-services.sh` controls loopback-only PostgreSQL/pgvector, Mailpit, and LocalStack from `compose.yaml`; `docs/local-development-services.md` documents endpoints and troubleshooting.
- Pull requests: `.github/workflows/quality.yml` runs frozen install, security and license gates, formatting, lint, typecheck, unit tests, build, and five-project Playwright smoke coverage.
- Contributor entrypoint: `CONTRIBUTING.md` documents clean setup, the first test, services, the current migration boundary, all verification gates, repository ownership, and troubleshooting.
- Shared primitives: `@bbw/shared` exports branded identifiers, timestamps, pagination, money, actor, and tenant context parsers with compile-time brand separation.
- UI tokens: `@bbw/ui` exports accessible semantic colors and extensible typography, spacing, radius, elevation, breakpoint, and motion tokens with a local preview.
- API contracts: `@bbw/shared` exports typed success/failure envelopes, stable error codes, field errors, pagination data, and deterministic examples.
- Analytics contracts: `@bbw/shared` exports typed acquisition, onboarding, engagement, sharing, and reliability event payloads with timestamp and payload guards.
- API service: `apps/api/src/server.ts` provides a bootable Fastify instance with health/readiness, request correlation, and signal shutdown.
- Application shell: `@bbw/ui` exports public/member/management navigation, breadcrumbs, and responsive drawer primitives.
- HTTP client: `@bbw/api-client` adds bearer authentication, correlation IDs, timeout handling, and typed error mapping for browser/server callers.
- OpenAPI: `apps/api/openapi.json` is generated by `scripts/openapi/generate-openapi.mjs`; `pnpm openapi:check` validates deterministic output and required health/readiness responses.
- Infrastructure entrypoint: `infra/cdk.json` runs `infra/src/index.ts`; `BBW_CDK_ENV=stage1` selects the single Stage 1 environment and `BBW_STAGE1_ACCOUNT` optionally binds the account without lookups.
- Optional external integrations: `BBW_SES_DOMAIN=bbw.incendiollc.com` is verified and SES event capture is deployed. `BBW_SES_USE_EXISTING_IDENTITY=true` attaches the stack to a previously verified identity during domain rotation. GitHub OIDC is deployed for `IncendioLLC/bbw`, restricted to the immutable `stage1` subject; the repository workflow identity and synth test passed.
- Deployed Stage 1 resources: account `394824061039`, VPC `vpc-0ab3bf74d275df201`, ECS cluster `bbw-stage1`, PostgreSQL endpoint in private subnets, and generated Secrets Manager database credentials. Do not expose the endpoint publicly.
- Infrastructure naming: `infra/src/naming.ts` provides deterministic `bbw-{environment}-{component}` names and mandatory Application/Environment/Owner tags with a 63-character guard.
- AWS bootstrap: `infra/src/bootstrap.ts` validates the Stage 1 account ID, deployment role name, and `us-east-1`; `docs/aws-account-bootstrap.md` records single-account bootstrap and OIDC prerequisites.
- Architecture decision: `docs/adr/0001-single-account-stage1.md` defers AWS Organizations account isolation while preserving account-boundary interfaces for Stage 2/3.
- Infrastructure constructs: `network.ts`, `security.ts`, `storage.ts`, `messaging.ts`, `events.ts`, `database.ts`, `compute.ts`, `email.ts`, and `oidc.ts` are covered by 18 CDK assertion/unit tests.

## 5. Verification state

- Task records: 213.
- Unique IDs, dependency references, graph acyclicity, and ready/pending consistency: passed.
- Every task has a work area, deliverable, test plan, and verification field.
- `progress.html` embedded data matches all 213 task records.
- Dashboard JavaScript syntax and no-external-asset checks passed.
- Live visual browser inspection was unavailable because the browser-control connection could not initialize.
- All 41 completed tasks passed their defined test plans. INF-008/009 have live RDS configuration evidence and private ECS TLS smoke tasks with exit code 0; INF-014 has an ACTIVE container-insights ECS cluster and successful private Fargate smoke task; INF-013 has successful SES verification, tagged simulator delivery, and captured SQS event; INF-022 has a successful GitHub Actions OIDC identity and CDK synth run.

## 6. Active, ready, and blocked work

### In progress
None.

### Ready
- `INF-019` — Create the shared application load balancer.
- `INF-023` — Add the Stage 1 deployment workflow.

### Blocked
None.

## 7. Known risks and assumptions

- AWS account identifiers, deployment credentials, DNS ownership, and production secrets will be required later. Block only the smallest affected task if unavailable.
- Brand assets, legal wording, approved launch content, and final curated knowledge are business-owned and outside this engineering graph. Use clearly labeled fixtures and configurable content meanwhile.
- The repository currently has no commits and all visible files are untracked. Preserve user files; Git cannot currently restore them.
- The $500/month infrastructure target is soft and does not authorize weakening reliability or security.
- The final security scan is green. The license gate currently reports newly introduced transitive `LGPL-3.0-or-later` (`@img/sharp-libvips-darwin-arm64`) and `CC-BY-4.0` (`caniuse-lite`) licenses from the Next.js shells; legal/owner approval or dependency substitution is required before the license gate can be green again.
- AWS account isolation is deferred; before production scale-up, a follow-up task must add Organizations accounts and promotion boundaries.
- All currently defined Milestone 3 blockers are resolved; downstream Milestone 3 implementation tasks are pending their declared dependencies.

## 8. Resume instructions

1. Read `implementation_rules.md`.
2. Read this file for current system truth.
3. Read the selected task in `tasks.md`; confirm it is `ready` with no dependencies.
4. Inspect only that task's work area and directly related contracts.
5. Have the coordinator mark it `in_progress` before product edits.
6. After verification, report the status delta required by `implementation_rules.md`.

## 9. Recent verified completions

- `ARC-005` — Added independently buildable management Next.js shell with management-only navigation and deny-by-default access.
- `ARC-006` — Added worker runtime with structured job lifecycle logs, health signal, graceful shutdown, and SIGTERM handling.
- `ARC-009` — Added shared accessible design tokens, WCAG AA semantic contrast tests, and a local token preview.
- `ARC-002` — Added typed API success/failure envelopes, stable error codes, field errors, pagination data, and deterministic examples.
- `ARC-010` — Added accessible foundational UI primitives for controls, feedback, dialogs, cards, and loading states.
- `ARC-012` — Added typed acquisition, onboarding, engagement, sharing, and reliability analytics event contracts with payload guards.
- `ARC-003` — Added bootable Fastify health/readiness endpoints, request correlation, structured startup failure logs, and graceful signal shutdown.
- `ARC-011` — Added shared public/member/management navigation, breadcrumbs, and responsive drawer shell components.
- `ARC-007` — Added browser/server-safe HTTP client with bearer auth, request IDs, timeouts, typed envelopes, and error mapping.
- `ARC-008` — Added deterministic OpenAPI 3.1 generation and validation for the API health/readiness contract.
- `INF-001` — Added typed CDK app/environment scaffold and verified synth for management, non-production, and production.
- `INF-003` — Added deterministic infrastructure naming and mandatory tag policy with unit coverage.
- `INF-002` — Re-scoped bootstrap to one Stage 1 account under ADR-0001; schema, documentation, tests, and Stage 1 synth pass.
- `INF-004` — Added two-AZ Stage 1 subnet tiers.
- `INF-005` — Added NAT gateways and VPC endpoints.
- `INF-006` — Added explicit Stage 1 cost profile.
- `INF-007` — Added least-privilege security groups.
- `INF-010` — Added private encrypted storage buckets.
- `INF-011` — Added encrypted queues and DLQs.
- `INF-012` — Added EventBridge bus and schedules.
- `INF-008` — Deployed and verified PostgreSQL 17 Multi-AZ RDS with private TLS smoke connectivity.
- `INF-009` — Verified the Stage 1 PostgreSQL profile with a second private TLS smoke task.
- `INF-014` — Verified the ECS cluster, scoped roles, container insights, and private Fargate smoke task.
- `INF-022` — Deployed immutable-subject GitHub OIDC trust and passed the repository's AWS identity and CDK synth workflow.
- `INF-013` — Verified SES Easy DKIM, deployed event capture, and captured a tagged simulator delivery event in SQS.
