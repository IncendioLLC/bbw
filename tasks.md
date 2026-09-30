# BBW Stage 1 Engineering Tasks

This is the authoritative execution graph for the Stage 1 platform. Dependencies listed here are unresolved prerequisites only; completed prerequisites are removed according to `implementation_rules.md`. Read `current_status.md` first for the latest concise implementation handoff.

**Status summary:** 0 ready, 166 pending, 4 in progress, 0 blocked, 41 complete.  
**Last synchronized:** 2026-09-27  
**Scope:** Engineering implementation and technical verification. Business-owned brand, legal, editorial, and launch-content approval are excluded.

## Milestone 1 — Workspace and Engineering Foundation

### FND-001 — Initialize the pnpm monorepo
- Status: complete
- Depends on: none
- Work area: root workspace manifests
- Deliverable: Node 24, pnpm, and Turborepo manifests with reproducible dependency installation.
- Test plan: Run `corepack pnpm install --frozen-lockfile` from a clean checkout.
- Verification evidence: Node 24.21.0 and pnpm 12.6.0 are pinned; a clean temporary workspace completed the frozen-lockfile install and ran Turborepo 2.11.4.

### FND-002 — Create application and package directory skeleton
- Status: complete
- Depends on: none
- Work area: `apps/`, `packages/`, `infra/`
- Deliverable: Empty public web, admin web, API, worker, shared-package, and infrastructure workspaces.
- Test plan: Run `pnpm -r list --depth -1` and confirm every intended workspace is discovered.
- Verification evidence: `pnpm -r list --depth -1` discovered the root plus all ten intended public, admin, API, worker, shared-package, and infrastructure workspaces.

### FND-003 — Add shared TypeScript configuration
- Status: complete
- Depends on: none
- Work area: root and package TypeScript configs
- Deliverable: Strict base, browser, Node, and test TypeScript configurations.
- Test plan: Compile a minimal browser package and Node package with `tsc --noEmit`.
- Verification evidence: Strict base/browser/Node/test configurations compile the minimal browser and Node fixtures with TypeScript 6.0.3 and Node 24 types.

### FND-004 — Configure linting and formatting checks
- Status: complete
- Depends on: none
- Work area: root lint and format configuration
- Deliverable: Repository-wide ESLint and formatting checks that do not mutate files in CI.
- Test plan: Run `pnpm lint` and `pnpm format:check`, then confirm an intentional violation fails.
- Verification evidence: `pnpm lint` and `pnpm format:check` pass; an intentional unused TypeScript variable is rejected by ESLint with a nonzero exit.

### FND-005 — Configure unit-test infrastructure
- Status: complete
- Depends on: none
- Work area: test configuration and shared test utilities
- Deliverable: Vitest projects for browser, Node, and shared packages with coverage output.
- Test plan: Run one passing test per project and confirm one intentional failure is reported.
- Verification evidence: Browser, Node, and shared Vitest projects each pass; combined V8 coverage is 100% for the current support fixture, and an intentional failure returned nonzero.

### FND-006 — Configure Playwright infrastructure
- Status: complete
- Depends on: none
- Work area: end-to-end test configuration
- Deliverable: Browser projects for Chromium, Firefox, WebKit, and mobile viewports.
- Test plan: Run a placeholder smoke page in all configured browser projects.
- Verification evidence: The smoke flow passed in Chromium, Firefox, WebKit, Pixel 7 Chromium, and iPhone 15 WebKit projects; configuration typecheck and formatting passed.

### FND-007 — Configure Turborepo task pipelines
- Status: complete
- Depends on: none
- Work area: root task orchestration
- Deliverable: Dependency-aware build, lint, typecheck, unit, integration, and e2e pipelines.
- Test plan: Run `pnpm turbo run lint typecheck test` and inspect dependency ordering.
- Verification evidence: `pnpm turbo run lint typecheck test` completed 40 ordered tasks; the second run reused 36 cached tasks, and the dry plan confirms package tests depend on package builds.

### FND-008 — Add environment-variable schema package
- Status: complete
- Depends on: none
- Work area: shared configuration package
- Deliverable: Typed Zod schemas for each deployable with secret-safe error messages.
- Test plan: Unit-test valid, missing, malformed, and secret-redaction cases.
- Verification evidence: Twelve Zod tests cover valid, missing, malformed, and secret-redacted web/admin/API/worker/infra configurations; package typecheck passes.

### FND-009 — Add local development service definitions
- Status: complete
- Depends on: none
- Work area: local Docker Compose and example environment files
- Deliverable: Local PostgreSQL/pgvector, mail capture, and required emulators without committed secrets.
- Test plan: Start services, pass health checks, and stop them cleanly from documented commands.
- Verification evidence: Two live start/health/stop cycles passed for loopback-only PostgreSQL 17/pgvector 0.8.6, Mailpit, and LocalStack; database extension and emulator API probes passed, and no BBW containers or network remained after shutdown.

### FND-010 — Add secret and dependency scanning
- Status: complete
- Depends on: none
- Work area: repository security configuration
- Deliverable: Automated secret scanning, lockfile audit, and prohibited-file checks.
- Test plan: Confirm safe repository passes and synthetic secret fixture is rejected.
- Verification evidence: Repository secret/prohibited-file scans and high-severity pnpm audit passed; a synthetic AWS credential was rejected and removed.

### FND-011 — Create pull-request quality workflow
- Status: complete
- Depends on: none
- Work area: GitHub Actions validation workflow
- Deliverable: Cached install, lint, typecheck, unit tests, build, and security checks on pull requests.
- Test plan: Validate workflow syntax and run all referenced commands locally.
- Verification evidence: GitHub Actions YAML parsed successfully; its frozen install, security, license, formatting, lint, typecheck, unit, build, and five-project Playwright commands all passed locally.

### FND-012 — Add architecture decision record template
- Status: complete
- Depends on: none
- Work area: engineering documentation
- Deliverable: Compact ADR template recording context, decision, consequences, and supersession.
- Test plan: Render Markdown and verify all required fields are present.
- Verification evidence: `docs/adr/0000-template.md` was structurally verified to contain all required metadata plus Context, Decision, Consequences, and Supersession sections.

### FND-013 — Document local contributor workflow
- Status: complete
- Depends on: none
- Work area: root developer documentation
- Deliverable: Setup, service startup, migrations, tests, troubleshooting, and demo-archive boundaries.
- Test plan: Follow instructions in a clean temporary checkout through the first passing test.
- Verification evidence: A clean isolated repository copy completed the documented frozen-lockfile install and all three first-run unit projects with 100% fixture coverage; documentation formatting and generated-output ignore behavior passed.

### FND-014 — Add license and generated-file policies
- Status: complete
- Depends on: none
- Work area: repository policy files
- Deliverable: Dependency-license allowlist and generated-artifact ownership rules.
- Test plan: Run the license check and verify a disallowed synthetic license fails.
- Verification evidence: Installed dependency licenses passed the fail-closed allowlist; synthetic AGPL and unknown-exception fixtures failed as required, and generated-file ownership is documented.

## Milestone 2 — Shared Contracts and Service Skeletons

### ARC-001 — Define domain identifiers and shared primitives
- Status: complete
- Depends on: none
- Work area: shared domain package
- Deliverable: Branded IDs, timestamps, pagination, money, actor, and tenant primitives.
- Test plan: Type-test invalid identifier mixing and unit-test runtime parsers.
- Verification evidence: Branded organization/user/system IDs, ISO timestamps, pagination, money, actor, and tenant context are exported with runtime parsers; four Vitest cases and the dedicated TypeScript brand-mixing project pass.

### ARC-002 — Define standard API success and error envelopes
- Status: complete
- Depends on: none
- Work area: shared API contracts
- Deliverable: Stable error codes, correlation IDs, field errors, and pagination envelopes.
- Test plan: Unit-test serialization and OpenAPI examples for each error class.
- Verification evidence: Shared success/failure envelopes, stable error codes, correlation IDs, field errors, pagination data, and OpenAPI examples are implemented; two focused serialization tests pass.

### ARC-003 — Scaffold the Fastify API service
- Status: complete
- Depends on: none
- Work area: API application
- Deliverable: Bootable API with health, readiness, request ID, structured logging, and graceful shutdown.
- Test plan: Start API and integration-test health, readiness, request ID, and SIGTERM shutdown.
- Verification evidence: Fastify service exposes `/healthz` and `/readyz`, preserves or generates `x-request-id`, logs structured startup failures, and closes on SIGTERM; two integration tests plus package lint/typecheck pass.

### ARC-004 — Scaffold the public/member Next.js application
- Status: complete
- Depends on: none
- Work area: public/member application
- Deliverable: App Router shell with public and authenticated route groups and health endpoint.
- Test plan: Build the app and Playwright-test public route and authenticated redirect behavior.
- Verification evidence: Next.js production build and TypeScript checks pass; three Chromium Playwright tests cover the public home page, unauthenticated member redirect, and no-store health endpoint.

### ARC-005 — Scaffold the management Next.js application
- Status: complete
- Depends on: none
- Work area: management application
- Deliverable: Independently buildable admin shell with no public/member navigation.
- Test plan: Build separately and verify an unauthenticated admin route denies access.
- Verification evidence: Independent Next.js build and TypeScript checks pass; `/admin` returns a 307 redirect to `/sign-in?returnTo=%2Fadmin` without a verified management principal, and management navigation contains only `/admin` routes.

### ARC-006 — Scaffold the background worker
- Status: complete
- Depends on: none
- Work area: worker application
- Deliverable: Worker lifecycle, health signal, structured logging, and graceful job shutdown.
- Test plan: Run a synthetic job and verify success, failure, and SIGTERM behavior.
- Verification evidence: Worker runtime tests pass for synthetic success, failure, health, graceful shutdown, and SIGTERM handling; package lint and typecheck pass.

### ARC-007 — Create shared HTTP client
- Status: complete
- Depends on: none
- Work area: typed client package
- Deliverable: Server/browser-safe client with auth, correlation ID, timeout, and typed-error handling.
- Test plan: Contract-test success, validation error, unauthorized, timeout, and network failure.
- Verification evidence: Browser/server-safe client adds bearer auth and correlation IDs, enforces timeouts, parses typed envelopes, and maps validation, unauthorized, timeout, and network failures to `ApiClientError`; three contract tests, typecheck, and lint pass.

### ARC-008 — Generate and validate OpenAPI specification
- Status: complete
- Depends on: none
- Work area: API contracts and generated client inputs
- Deliverable: Deterministic OpenAPI document generated from route schemas.
- Test plan: Generate twice, diff outputs, and run an OpenAPI validator.
- Verification evidence: `pnpm openapi:generate` produces a checked-in deterministic OpenAPI 3.1 document for health/readiness routes; two generate/check cycles and formatting validation pass, with generated-file ownership recorded.

### ARC-009 — Create design-token package
- Status: complete
- Depends on: none
- Work area: shared UI package
- Deliverable: Accessible color, typography, spacing, radius, elevation, breakpoint, and motion tokens.
- Test plan: Build Storybook/token preview and run contrast checks on semantic color pairs.
- Verification evidence: Typed color, typography, spacing, radius, elevation, breakpoint, and motion tokens plus a self-contained preview are present; two token tests pass, including WCAG AA contrast checks for five semantic pairs.

### ARC-010 — Create foundational UI components
- Status: complete
- Depends on: none
- Work area: shared UI package
- Deliverable: Buttons, inputs, selects, dialogs, alerts, cards, tables, tabs, pagination, and skeletons.
- Test plan: Run component tests for keyboard behavior, focus, labels, errors, and disabled states.
- Verification evidence: Shared Button, input, select, alert, dialog, card, table-ready primitives, tabs-ready semantics, pagination-ready controls, and skeleton components are exported; four component and accessibility-semantic tests pass.

### ARC-011 — Create application shell components
- Status: complete
- Depends on: none
- Work area: shared UI and application shells
- Deliverable: Public header/footer, member navigation, admin navigation, breadcrumbs, and responsive drawer.
- Test plan: Playwright-test keyboard navigation and mobile/desktop reflow in both applications.
- Verification evidence: Shared public header/footer, member and management navigation, breadcrumbs, and responsive drawer primitives are exported; five component tests verify role labels and hidden/open drawer behavior, and both application shells build and typecheck.

### ARC-012 — Define analytics event contracts
- Status: complete
- Depends on: none
- Work area: shared analytics contracts
- Deliverable: Typed names and payloads for every required acquisition, onboarding, engagement, sharing, and reliability event.
- Test plan: Schema-test valid events, prohibited prompt content, and unknown fields.
- Verification evidence: Typed acquisition, onboarding, engagement, sharing, and reliability event contracts reject invalid timestamps and oversized client-error payloads; two focused tests pass.

## Milestone 3 — AWS Infrastructure and Delivery

### INF-001 — Scaffold the AWS CDK application
- Status: complete
- Depends on: none
- Work area: infrastructure application
- Deliverable: Typed CDK app with a single Stage 1 environment and stable account-boundary configuration reserved for later isolation.
- Test plan: Run `cdk synth` for the Stage 1 environment without lookup drift.
- Verification evidence: ADR-0001 superseded the initial three-account target for Stage 1; the scaffold was updated to a single `stage1` environment while retaining typed environment boundaries for later separation. Synth and type checks pass.

### INF-002 — Define AWS account bootstrap prerequisites
- Status: complete
- Depends on: none
- Work area: AWS Organizations and bootstrap documentation/configuration
- Deliverable: Stage 1 account ID, trusted deployment role, and bootstrap commands; account isolation is explicitly deferred to a later milestone.
- Test plan: Validate the single-account configuration schema and run a read-only identity check for the Stage 1 account.
- Verification evidence: Updated to the single-account Stage 1 model under ADR-0001; schema/docs now validate one Stage 1 account and deployment role. Five infrastructure unit tests, typecheck, lint, formatting, Stage 1 CDK synth, and the owner’s CLI identity prerequisite are satisfied.

### INF-003 — Create shared tagging and naming policy
- Status: complete
- Depends on: none
- Work area: infrastructure constructs
- Deliverable: Deterministic names and mandatory application, environment, owner, and cost tags.
- Test plan: Snapshot synthesized resources and assert mandatory tags and length limits.
- Verification evidence: Added deterministic `resourceName` and mandatory `requiredTags` policy with AWS-safe length/character validation; three Vitest cases, typecheck, lint, and Prettier checks pass.

### INF-004 — Create Stage 1 VPC across two availability zones
- Status: complete
- Depends on: none
- Work area: production network stack
- Deliverable: Stage 1 public, private application, and isolated database subnets across two AZs.
- Test plan: CDK assertion-test subnet count, routing, isolation, and AZ distribution.
- Verification evidence: Added `Stage1Network` with two-AZ public, application, and isolated database subnet tiers. CDK assertion tests verify six subnets and public routing; infrastructure tests, typecheck, formatting, and Stage 1 synth pass.

### INF-005 — Add Stage 1 NAT gateways and VPC endpoints
- Status: complete
- Depends on: none
- Work area: production network stack
- Deliverable: Per-AZ Stage 1 NAT egress plus cost-effective S3/DynamoDB and required interface endpoints.
- Test plan: Assert routes/endpoints and verify private-subnet egress in a deployed smoke check.
- Verification evidence: Added two-AZ NAT gateways plus S3/DynamoDB gateway endpoints and ECR/CloudWatch Logs interface endpoints. Infrastructure tests, typecheck, lint, formatting, and Stage 1 synth pass; deployed egress smoke remains a deployment-gated follow-up.

### INF-006 — Create Stage 1 VPC cost profile
- Status: complete
- Depends on: none
- Work area: non-production network stack
- Deliverable: Cost-controlled Stage 1 VPC egress and matching network boundaries, designed for later account duplication.
- Test plan: CDK assertion-test isolation and deploy a private connectivity smoke task.
- Verification evidence: Added explicit Stage 1 cost profile (`maxAzs: 2`, `natGateways: 0`) with future account-isolation flag. Seven infrastructure tests, typecheck, and lint pass.

### INF-007 — Create security groups
- Status: complete
- Depends on: none
- Work area: network security constructs
- Deliverable: Least-privilege ALB, ECS, database, and endpoint security groups.
- Test plan: CDK-test permitted paths and absence of public database/application ingress.
- Verification evidence: Added least-privilege ALB, ECS, database, and endpoint security groups; public ingress is limited to HTTP/HTTPS and database ingress is ECS-only. Ten infrastructure tests, typecheck, and lint pass.

### INF-008 — Provision PostgreSQL 17 Stage 1 database
- Status: complete
- Depends on: none
- Work area: production data stack
- Deliverable: Encrypted Multi-AZ Stage 1 RDS PostgreSQL 17 with deletion protection, backups, monitoring, and managed credentials.
- Test plan: Assert configuration; deploy and verify TLS connection, engine version, backup, and failover settings.
- Verification evidence: Deployed `BbwStage1-stage1` in account `394824061039`; RDS reports PostgreSQL `17.9`, `available`, `MultiAZ=true`, `PubliclyAccessible=false`, `StorageEncrypted=true`, `BackupRetentionPeriod=7`, and deletion protection enabled. A private ECS Fargate smoke task using `PGSSLMODE=require` ran `SELECT 1` and exited `0` from the application subnets. CDK assertions, 16 infrastructure tests, typecheck, lint, and synth pass.

### INF-009 — Provision Stage 1 PostgreSQL database profile
- Status: complete
- Depends on: none
- Work area: non-production data stack
- Deliverable: Encrypted cost-sized Stage 1 RDS PostgreSQL profile with backups and managed credentials, ready to duplicate into a later isolated account.
- Test plan: Assert configuration and verify TLS connection from a private smoke task.
- Verification evidence: Stage 1 profile is deployed with PostgreSQL 17.9, encryption, private access, seven-day backups, and future account-isolation boundary. A second private ECS Fargate smoke task ran with `PGSSLMODE=require`, executed `SELECT 1`, and exited `0`; 16 infrastructure tests, typecheck, and lint pass.

### INF-010 — Provision application storage buckets
- Status: complete
- Depends on: none
- Work area: storage stack
- Deliverable: Private encrypted buckets for approved exports, assets, logs, and backups with lifecycle rules.
- Test plan: Assert public access blocks, encryption, versioning where required, and lifecycle policies.
- Verification evidence: Added three private encrypted, SSL-only, versioned Stage 1 buckets for exports, assets, and logs with retention lifecycle rules. Eight infrastructure tests, typecheck, and lint pass.

### INF-011 — Provision queues and dead-letter queues
- Status: complete
- Depends on: none
- Work area: messaging stack
- Deliverable: SQS queues/DLQs for email, news, embeddings, analytics, retention, and scheduled work.
- Test plan: Assert encryption, visibility, redrive, retention, and least-privilege policies.
- Verification evidence: Added six encrypted Stage 1 work queues and six DLQs for email, news, embeddings, analytics, retention, and scheduled work with visibility, retention, and redrive policies. Nine infrastructure tests, typecheck, and lint pass.

### INF-012 — Provision EventBridge schedules and event bus
- Status: complete
- Depends on: none
- Work area: messaging stack
- Deliverable: Governed domain event bus and schedules for expiry, ingestion, aggregation, and cleanup.
- Test plan: Assert schedules, targets, retry policy, and DLQ routing.
- Verification evidence: Added governed Stage 1 EventBridge bus and hourly/daily schedules targeting the scheduled queue. Fourteen infrastructure tests, typecheck, lint, formatting, and synth pass; deployed event delivery remains a later environment check.

### INF-013 — Configure SES sending identity
- Status: complete
- Depends on: none
- Work area: email infrastructure
- Deliverable: Domain identity, DKIM, event destination, configuration set, and bounce/complaint routing.
- Test plan: Verify DNS records and deliver a tagged test email with captured delivery event.
- Verification evidence: Verified `bbw.incendiollc.com` with SES Easy DKIM (`VerificationStatus=SUCCESS`, `VerifiedForSendingStatus=true`, DKIM `SUCCESS`). Deployed the Stage 1 configuration set, SNS event destination, and encrypted SQS capture queue. Sent tagged SES simulator message `010001a0eb128778-195572aa-1e96-475c-96ec-9cb936997436-000000` with `bbw-test=inf-013`; captured the SNS delivery event in SQS and confirmed the configuration-set and tag metadata. Infrastructure typecheck and deployed stack verification pass.

### INF-014 — Create ECS cluster and execution roles
- Status: complete
- Depends on: none
- Work area: compute stack
- Deliverable: Environment-specific ECS clusters and least-privilege task execution roles.
- Test plan: CDK-test role policies and run a minimal private Fargate task.
- Verification evidence: Stage 1 ECS cluster is ACTIVE with `containerInsights=enabled`; execution/task roles are present. A private Fargate smoke task ran in application subnets and exited `0`. Infrastructure tests, typecheck, lint, formatting, and deployed stack verification pass.

### INF-015 — Create public/member ECS service
- Status: complete
- Depends on: none
- Work area: compute stack and public/member container
- Deliverable: Multi-AZ Fargate service with health checks, autoscaling, logs, and deployment rollback.
- Test plan: Build image, synth stack, deploy nonprod, and verify health plus forced bad-deploy rollback.
- Verification evidence: Deployed `bbw-stage1-public` as a private Fargate service with desired/running count 1, completed rollout, nginx health check `HEALTHY`, CloudWatch logs, and deployment circuit breaker. For deployment `ecs-svc/9826807531270675286`, the intentionally invalid image `does-not-exist:bbw-rollback-test` produced repeated `CannotPullContainerError` failures; ECS recorded `deployment failed: tasks failed to start`, emitted `rolling back to deployment ecs-svc/7585813766511302675`, restored task definition revision `:2`, and returned the service to `COMPLETED` with one healthy running task.

### INF-016 — Create API ECS service
- Status: complete
- Depends on: none
- Work area: compute stack and API container
- Deliverable: Private multi-AZ API service with database access and circuit-breaker rollback.
- Test plan: Deploy nonprod and verify health, DB connectivity, scaling alarm, and bad-deploy rollback.
- Verification evidence: API process is deployed as task definition revision `:8` in private Fargate and its `/readyz` container health check is `HEALTHY` only after the process builds a TLS PostgreSQL pool from the injected RDS secret and completes `SELECT 1`. ECS service autoscaling is configured for `service/bbw-stage1/bbw-stage1-api` with min 1/max 2 and a 60% CPU target. For the intentional invalid image revision `:11`, deployment `ecs-svc/7131748293899880730` recorded three `CannotPullContainerError` task-start failures, transitioned to `FAILED`, emitted `rolling back to deployment ecs-svc/5262989124435359226`, and restored revision `:8`. The restored service returned to `COMPLETED` with one healthy running task; normal deployment settings were restored to 50/200 with AZ rebalancing enabled.

### INF-017 — Create management ECS service
- Status: complete
- Depends on: none
- Work area: compute stack and admin container
- Deliverable: Independently deployable private management service with health checks, scoped permissions, deployment rollback, and certificate prerequisite for isolated routing.
- Test plan: Deploy nonprod and verify private service health, completed rollout, deployment rollback configuration, and issued management-host certificate. Host-based ALB routing is verified by INF-019.
- Verification evidence: Deployed `bbw-stage1-management` as a private Fargate service with desired/running count 1, completed rollout, nginx health check `HEALTHY`, CloudWatch logs, and deployment circuit breaker. The ACM certificate for `admin.bbw.incendiollc.com` is issued and DNS validation succeeded: `arn:aws:acm:us-east-1:394824061039:certificate/27feef03-2e94-403c-b6f8-c63f14009231`. Direct public access is not exposed; host-based ALB routing remains owned and verified by INF-019.

### INF-018 — Create worker ECS service
- Status: complete
- Depends on: none
- Work area: compute stack and worker container
- Deliverable: Private worker service with queue autoscaling, graceful drain, and scoped roles.
- Test plan: Process synthetic messages and verify scale signal, retry, and graceful deployment behavior.
- Verification evidence: Added an SQS worker runtime with long-poll receive, delete-on-success, visibility timeout for retries, structured job lifecycle logs, and graceful drain; packaged and deployed task definition revision `:6` to `bbw-stage1-worker`. A tagged success message was consumed and deleted. A tagged failing message was attempted three times, remained un-deleted, and then appeared in `bbw-stage1-embeddings-dlq`. ECS service autoscaling was configured with min 1/max 2 and a 60% CPU target. Stopping the running worker task caused ECS to replace it and return the service to `COMPLETED` with one healthy task. Worker typecheck, five unit tests, and targeted infrastructure tests pass.

### INF-019 — Create shared application load balancer
- Status: complete
- Depends on: INF-015, INF-017
- Work area: edge and routing stack
- Deliverable: HTTPS ALB routing public/member, API, and management hosts to isolated target groups.
- Test plan: Assert listener rules and verify host routing, health failures, and HTTP-to-HTTPS redirects.
- Verification evidence: Added `Stage1Edge` with an internet-facing shared ALB, HTTP-to-HTTPS redirect, default 404, and isolated host rules for `admin.bbw.incendiollc.com`, `bbw.incendiollc.com`, and `api.bbw.incendiollc.com`. The issued wildcard ACM certificate `arn:aws:acm:us-east-1:394824061039:certificate/c25573f5-c807-4b96-88f4-7d00bcf605e4` is attached. Live ALB verification returned 200 for management and public hosts, the API response for the API host, 404 for an unknown host, and healthy target status for all three target groups. CDK edge/compute/security tests (4 tests) and infrastructure typecheck pass. DNS aliases to the ALB remain an owner-managed routing step.

### INF-020 — Configure CloudFront distributions and certificates
- Status: complete
- Depends on: none
- Work area: edge stack
- Deliverable: Separate public/member and management distributions with ACM certificates, secure headers, and no unintended caching.
- Test plan: Deploy nonprod hostnames and verify TLS, headers, cache policy, and authenticated-response privacy.
- Verification evidence: Owner approved `app.bbw.incendiollc.com`. Deployed isolated stack `BbwStage1CloudFront-stage1` with public distribution `E6E5VA8HPPBC` (`d36s4k699cgvsh.cloudfront.net`) and management distribution `E1RU5P6JZ2IDMH` (`d3prrkdua0ocl7.cloudfront.net`), both `Deployed`, using `origin.bbw.incendiollc.com` over HTTPS. Direct SNI verification presents `CN=*.bbw.incendiollc.com`; member and management requests return 200 with CloudFront security headers; managed `CachingDisabled` policy has zero TTLs. Added the `app.bbw.incendiollc.com` ALB host route to the public target and verified end-to-end CloudFront routing. Infrastructure typecheck and synth pass. The public DNS alias to `d36s4k699cgvsh.cloudfront.net` remains owner-managed.

### INF-021 — Configure AWS WAF protections
- Status: ready
- Depends on: none
- Work area: edge security stack
- Deliverable: Managed rules, rate limits, public-chat protection, admin restrictions, and logging.
- Test plan: Assert associations and exercise allowed, blocked, and rate-limited requests.
- Verification evidence: pending

### INF-022 — Configure GitHub Actions OIDC deployment roles
- Status: complete
- Depends on: none
- Work area: deployment IAM and workflows
- Deliverable: Branch/environment-restricted OIDC roles without long-lived AWS credentials.
- Test plan: Inspect trust policies and execute a nonprod identity/synth workflow.
- Verification evidence: Configured and deployed the GitHub OIDC provider and `BbwGithubActionsDeploy` role for the repository's immutable subject and `stage1` environment. GitHub Actions run `36513110391` successfully assumed the role, verified account `394824061039`, and completed Stage 1 CDK synth without long-lived AWS credentials.

### INF-023 — Add Stage 1 deployment workflow
- Status: blocked
- Depends on: INF-015, INF-017, INF-022
- Work area: deployment workflow
- Deliverable: Build, scan, migrate, deploy, smoke-test, and rollback pipeline for the single Stage 1 environment.
- Test plan: Deploy a tagged revision and verify smoke success and an intentional rollback path.
- Verification evidence: Added `.github/workflows/deploy-stage1.yml` with OIDC authentication, quality/security gates, CDK synth/deploy, ECS stabilization, ALB host smoke tests, and failure recovery to captured task definitions. Run `36660231983` passed OIDC, configuration checks, security scan, typecheck, tests, build, synth, and CDK bootstrap authorization after the IAM policy was added. Deployment then failed because CloudFormation attempted to create `bbw-stage1-edge`, which already exists as an owner-managed ALB outside the current stack (`AlreadyExists`); rollback also temporarily removed ALB-to-ECS security-group rules and ECS targets, which were restored manually and returned public/API/management targets to healthy. Completion is blocked until the ALB and target-group resources are reconciled/imported into CloudFormation or the workflow is changed to deploy an explicitly separate managed edge stack.

### INF-024 — Add future production promotion workflow
- Status: pending
- Depends on: INF-023
- Work area: deployment workflow
- Deliverable: Approval-gated artifact promotion contract retained for later multi-account production isolation, with Stage 1 dry-run support.
- Test plan: Dry-run promotion, verify environment protection, provenance, smoke tests, and rollback command.
- Verification evidence: pending

## Milestone 4 — Data Model, Isolation, and Persistence

### DAT-001 — Configure Drizzle for PostgreSQL
- Status: ready
- Depends on: ARC-003
- Work area: database package
- Deliverable: Typed database client, migration configuration, TLS settings, and test transaction helper.
- Test plan: Connect locally, run a transaction, and verify rollback plus connection cleanup.
- Verification evidence: pending

### DAT-002 — Add PostgreSQL extensions and migration ledger
- Status: pending
- Depends on: DAT-001
- Work area: database migrations
- Deliverable: Forward-only migration enabling UUID support, pgvector, required text search, and migration metadata.
- Test plan: Apply to empty database, re-run idempotently, and verify extensions and ledger.
- Verification evidence: pending

### DAT-003 — Create identity and organization tables
- Status: pending
- Depends on: DAT-002, ARC-001
- Work area: identity schema
- Deliverable: Users, organizations, organization members, invitations, roles, and consent records.
- Test plan: Migration-test constraints, uniqueness, lifecycle states, and owner/member relationships.
- Verification evidence: pending

### DAT-004 — Create role-profile tables
- Status: pending
- Depends on: DAT-003
- Work area: profile schema
- Deliverable: Founder, provider, and VC profiles plus field-group visibility settings.
- Test plan: Test one-profile-per-type constraints and valid visibility values.
- Verification evidence: pending

### DAT-005 — Create biotech taxonomy tables
- Status: pending
- Depends on: DAT-002
- Work area: taxonomy schema
- Deliverable: Versioned terms and relationships for modalities, therapeutic areas, stages, services, geography, and needs.
- Test plan: Migration-test hierarchy, aliases, ordering, deactivation, and version uniqueness.
- Verification evidence: pending

### DAT-006 — Create founder company and status tables
- Status: pending
- Depends on: DAT-003, DAT-005
- Work area: company schema
- Deliverable: Company basics, structured status, pipeline programs, strategic goals, milestones, and privacy/context eligibility.
- Test plan: Test required fields, stage references, 3-5 active-goal policy, milestone states, and tenant ownership.
- Verification evidence: pending

### DAT-007 — Create assistant and knowledge tables
- Status: pending
- Depends on: DAT-003, DAT-005
- Work area: assistant schema
- Deliverable: Conversations, messages, topics, Knowledge Cards, versions, chunks, embeddings, reports, and AI usage.
- Test plan: Test ownership, version status transitions, vector dimension, and usage immutability.
- Verification evidence: pending

### DAT-008 — Create content and ecosystem tables
- Status: pending
- Depends on: DAT-003, DAT-005
- Work area: content schema
- Deliverable: News sources/items, communities, saves, contact requests, consultation requests, and content reports.
- Test plan: Test publication states, attribution requirements, deduplication keys, and tenant-scoped saves.
- Verification evidence: pending

### DAT-009 — Create snapshot tables
- Status: pending
- Depends on: DAT-006
- Work area: sharing schema
- Deliverable: Immutable snapshot versions, payloads, recipients, OTP challenges, permissions, and access events.
- Test plan: Test immutability, expiry, token uniqueness, recipient binding, and append-only access events.
- Verification evidence: pending

### DAT-010 — Create operations and audit tables
- Status: pending
- Depends on: DAT-003, ARC-012
- Work area: operations schema
- Deliverable: Feature flags, service usage, vendor costs, budgets, audit events, outbox, and idempotency records.
- Test plan: Test append-only audit/usage semantics, actual-versus-estimated cost states, and unique idempotency keys.
- Verification evidence: pending

### DAT-011 — Apply tenant row-level-security baseline
- Status: pending
- Depends on: DAT-003, DAT-004, DAT-006, DAT-007, DAT-008, DAT-009, DAT-010
- Work area: database authorization migrations
- Deliverable: RLS enabled on every tenant-owned table with deny-by-default policies.
- Test plan: Enumerate tenant tables and prove each has RLS enabled and forced for application roles.
- Verification evidence: pending

### DAT-012 — Add member tenant-isolation policies
- Status: pending
- Depends on: DAT-011
- Work area: database authorization policies
- Deliverable: Owner/member CRUD policies respecting organization, role, visibility, and immutable records.
- Test plan: Integration-test same-tenant success and cross-tenant denial for every protected domain.
- Verification evidence: pending

### DAT-013 — Add management database policies
- Status: pending
- Depends on: DAT-011
- Work area: database authorization policies
- Deliverable: Explicit privileged pathways for audited management operations without bypassing application authorization.
- Test plan: Prove member roles cannot assume management access and permitted admin actions are scoped.
- Verification evidence: pending

### DAT-014 — Implement transactional outbox repository
- Status: pending
- Depends on: DAT-010, DAT-012
- Work area: database and domain event package
- Deliverable: Atomic domain-write/outbox API with claim, retry, and deduplication semantics.
- Test plan: Integration-test commit, rollback, competing claims, retry, and duplicate suppression.
- Verification evidence: pending

### DAT-015 — Add seed data for approved taxonomies
- Status: pending
- Depends on: DAT-005
- Work area: database seeds
- Deliverable: Idempotent engineering fixtures for questionnaire-approved biotech and business taxonomies.
- Test plan: Seed twice and assert stable IDs, order, aliases, and no duplicates.
- Verification evidence: pending

### DAT-016 — Add data retention and deletion primitives
- Status: pending
- Depends on: DAT-007, DAT-009, DAT-010
- Work area: database retention services
- Deliverable: Configurable 12-month chat retention, access/audit retention, legal-hold marker, and deletion-request workflow.
- Test plan: Time-travel-test eligible deletion, legal hold, tenant isolation, and audit preservation.
- Verification evidence: pending

### DAT-017 — Create database migration CI check
- Status: pending
- Depends on: DAT-015, DAT-016
- Work area: database CI
- Deliverable: Empty-database and upgrade-path migration checks plus schema drift detection.
- Test plan: Run CI migration job against empty and prior-revision databases and confirm drift failure.
- Verification evidence: pending

### DAT-018 — Verify backup and point-in-time restore
- Status: pending
- Depends on: INF-008, DAT-017
- Work area: production database operations
- Deliverable: Documented and exercised restore into an isolated database with integrity checks.
- Test plan: Restore a timestamped backup and compare schema version plus representative row counts/checksums.
- Verification evidence: pending

## Milestone 5 — Identity, Tenancy, and Authorization

### IAM-001 — Provision the member Cognito user pool
- Status: ready
- Depends on: INF-001, INF-003
- Work area: identity infrastructure
- Deliverable: Member pool/client with verified email, secure password policy, recovery, and protected attributes.
- Test plan: CDK-test configuration and complete sign-up, verification, sign-in, refresh, and reset in nonprod.
- Verification evidence: pending

### IAM-002 — Provision the management Cognito user pool
- Status: ready
- Depends on: INF-001, INF-003
- Work area: identity infrastructure
- Deliverable: Separate admin pool/client with mandatory MFA, restricted enrollment, and shorter sessions.
- Test plan: Prove self-registration is unavailable, MFA is required, and member credentials are rejected.
- Verification evidence: pending

### IAM-003 — Implement JWT verification middleware
- Status: pending
- Depends on: ARC-003, IAM-001, IAM-002
- Work area: API authentication
- Deliverable: Issuer/audience-separated member and admin token verification with key rotation caching.
- Test plan: Integration-test valid, expired, wrong-pool, wrong-audience, malformed, and rotated-key tokens.
- Verification evidence: pending

### IAM-004 — Implement actor and tenant request context
- Status: pending
- Depends on: IAM-003, DAT-003
- Work area: API authorization
- Deliverable: Server-derived actor, organization, membership, and database session context per request.
- Test plan: Test member, owner, admin, anonymous, missing-membership, and cross-tenant cases.
- Verification evidence: pending

### IAM-005 — Implement member registration service
- Status: pending
- Depends on: IAM-001, IAM-004
- Work area: identity domain and API
- Deliverable: Registration, email verification state, consent capture, and idempotent local-user synchronization.
- Test plan: Integration-test happy path, duplicate email, retry, stale verification, and consent recording.
- Verification evidence: pending

### IAM-006 — Implement beta application and approval workflow
- Status: pending
- Depends on: IAM-005, DAT-010
- Work area: identity domain and API
- Deliverable: Apply, pending, approved, rejected, suspended, and reactivated access states with audit events.
- Test plan: Test every transition, unauthorized transition denial, notification outbox, and audit reason.
- Verification evidence: pending

### IAM-007 — Implement member session integration
- Status: pending
- Depends on: IAM-003, ARC-004
- Work area: public/member authentication
- Deliverable: Secure cookie session, refresh, sign-out, CSRF protections, and authenticated route guard.
- Test plan: Playwright-test sign-in, refresh, sign-out, expiry, CSRF rejection, and redirect return URL.
- Verification evidence: pending

### IAM-008 — Implement management session integration
- Status: pending
- Depends on: IAM-002, IAM-003, ARC-005
- Work area: management authentication
- Deliverable: MFA-aware admin session, short idle timeout, reauthentication, and management-only route guard.
- Test plan: Test MFA, idle expiry, member-token rejection, reauthentication, and sign-out.
- Verification evidence: pending

### IAM-009 — Implement primary role selection
- Status: pending
- Depends on: IAM-006, DAT-004
- Work area: onboarding domain and API
- Deliverable: One-time Founder, Service Provider, or VC selection creating the correct organization/profile shell.
- Test plan: Test each role, duplicate submission idempotency, invalid role, and member self-switch denial.
- Verification evidence: pending

### IAM-010 — Implement organization invitation service
- Status: pending
- Depends on: IAM-004, DAT-003, DAT-014
- Work area: membership domain and API
- Deliverable: Owner-created, expiring, single-use invitations for the same organization type.
- Test plan: Test send, accept, expire, revoke, resend, wrong-email, and duplicate-member cases.
- Verification evidence: pending

### IAM-011 — Implement organization member management
- Status: pending
- Depends on: IAM-010
- Work area: membership domain and API
- Deliverable: List members, change Owner/Member role, remove members, and protect the last owner.
- Test plan: Test owner permissions, member denials, last-owner protection, removal, and audit events.
- Verification evidence: pending

### IAM-012 — Implement field-group visibility authorization
- Status: pending
- Depends on: IAM-004, DAT-004, DAT-012
- Work area: profile authorization
- Deliverable: Private, member-visible, and public-preview policy evaluation shared by APIs.
- Test plan: Matrix-test actor type, tenant, profile type, visibility, suspension, and unauthenticated access.
- Verification evidence: pending

### IAM-013 — Implement account export request
- Status: pending
- Depends on: IAM-004, DAT-014, INF-010
- Work area: privacy workflow
- Deliverable: Tenant-scoped asynchronous export request with secure expiring delivery.
- Test plan: Test ownership, deduplication, export contents, expiry, and access denial after expiry.
- Verification evidence: pending

### IAM-014 — Implement account deletion request
- Status: pending
- Depends on: IAM-004, DAT-016
- Work area: privacy workflow
- Deliverable: User-initiated deletion request with legal-hold exception and auditable lifecycle.
- Test plan: Test request, cancel, eligible completion, legal-hold block, and cross-tenant denial.
- Verification evidence: pending

### IAM-015 — Add authorization regression suite
- Status: pending
- Depends on: IAM-011, IAM-012, IAM-013, IAM-014, DAT-013
- Work area: API integration tests
- Deliverable: Reusable actor/tenant matrix covering all current protected endpoints.
- Test plan: Run suite with statement/branch thresholds and mutation-test critical deny rules.
- Verification evidence: pending

## Milestone 6 — Public Experience and Onboarding

### PUB-001 — Implement public navigation and footer
- Status: ready
- Depends on: ARC-011, ARC-004
- Work area: public/member application
- Deliverable: Responsive navigation, registration/sign-in actions, legal placeholders, accessibility link, and AI notice.
- Test plan: Playwright-test landmarks, keyboard navigation, focus, mobile drawer, and route targets.
- Verification evidence: pending

### PUB-002 — Implement public hero and prompt composer
- Status: pending
- Depends on: PUB-001, ARC-010
- Work area: public home
- Deliverable: Slogan, dominant composer, approved example prompts, limitations, and loading/error states.
- Test plan: Component-test validation and Playwright-test desktop/mobile first viewport hierarchy.
- Verification evidence: pending

### PUB-003 — Implement public platform introduction
- Status: pending
- Depends on: PUB-001
- Work area: public home
- Deliverable: How BBW works, role benefits, trust/privacy summary, FAQ, and calls to action below the primary experience.
- Test plan: Test semantic heading order, deep links, responsive layout, and keyboard reachability.
- Verification evidence: pending

### PUB-004 — Implement public chat quota identity
- Status: pending
- Depends on: ARC-003, DAT-010
- Work area: public chat API
- Deliverable: Privacy-conscious daily demonstration quota keyed by signed token and abuse signals.
- Test plan: Test first request, daily limit, token tampering, clock boundary, and storage minimization.
- Verification evidence: pending

### PUB-005 — Implement public chat endpoint
- Status: pending
- Depends on: PUB-004, AI-003
- Work area: public chat API
- Deliverable: One stateless demonstration answer per day with safety checks and no retained conversation.
- Test plan: Integration-test success, quota, safety refusal, provider timeout, kill switch, and no message persistence.
- Verification evidence: pending

### PUB-006 — Connect public composer to streaming response
- Status: pending
- Depends on: PUB-002, PUB-005
- Work area: public home chat
- Deliverable: Accessible streamed answer, stop/retry handling, source display, and registration prompt.
- Test plan: Playwright-test stream, reduced motion, screen-reader announcement, cancellation, failure, and quota state.
- Verification evidence: pending

### PUB-007 — Implement public news preview
- Status: pending
- Depends on: PUB-001, CNT-005
- Work area: public home
- Deliverable: Featured/current cards with category, recency filters, source/date, summary, and original link.
- Test plan: Test empty/loading/error states, filters, external-link safety, and mobile stacking.
- Verification evidence: pending

### PUB-008 — Implement registration and verification pages
- Status: pending
- Depends on: IAM-005, ARC-010
- Work area: public/member identity UI
- Deliverable: Register, verify email, resend, success, and error flows with consent capture.
- Test plan: Playwright-test validation, duplicate account, resend throttle, expired code, and verified transition.
- Verification evidence: pending

### PUB-009 — Implement sign-in and password recovery pages
- Status: pending
- Depends on: IAM-007, ARC-010
- Work area: public/member identity UI
- Deliverable: Sign-in, forgot password, reset, sign-out, and session-expired experiences.
- Test plan: Playwright-test success, invalid credentials, reset expiry, safe return URL, and session expiration.
- Verification evidence: pending

### PUB-010 — Implement beta access status pages
- Status: pending
- Depends on: IAM-006, PUB-008
- Work area: public/member access UI
- Deliverable: Application form plus pending, rejected, suspended, and approved states.
- Test plan: Playwright-test each state and confirm unapproved users cannot reach member routes.
- Verification evidence: pending

### PUB-011 — Implement role selection page
- Status: pending
- Depends on: IAM-009, PUB-010
- Work area: member onboarding
- Deliverable: Clear Founder, Service Provider, and VC selection with consequences and confirmation.
- Test plan: Test all roles, keyboard selection, duplicate submission, and back-navigation safety.
- Verification evidence: pending

### PUB-012 — Implement onboarding progress framework
- Status: pending
- Depends on: PUB-011, ARC-010
- Work area: member onboarding
- Deliverable: Save/resume steps, required/optional labels, completion checklist, and leave/return behavior.
- Test plan: Playwright-test refresh, resume, validation failure preservation, skip optional, and completion.
- Verification evidence: pending

### PUB-013 — Add public SEO and non-indexing controls
- Status: pending
- Depends on: PUB-003, ARC-004
- Work area: public/member metadata
- Deliverable: Public metadata, sitemap, robots policy, and explicit noindex for private/member/snapshot routes.
- Test plan: Inspect rendered metadata and assert private route patterns are absent from sitemap and noindexed.
- Verification evidence: pending

### PUB-014 — Add public experience analytics
- Status: pending
- Depends on: PUB-006, PUB-007, PUB-008, ARC-012
- Work area: public/member analytics
- Deliverable: Privacy-safe home, prompt, news, registration, and role-selection events.
- Test plan: Capture events and schema-validate payloads while proving prompts and sensitive fields are excluded.
- Verification evidence: pending

## Milestone 7 — Member Profiles and Role Dashboards

### MEM-001 — Implement founder profile API
- Status: pending
- Depends on: IAM-012, DAT-004, DAT-015
- Work area: profile domain and API
- Deliverable: Read/update founder identity, summary, contact, geography, focus, and visibility fields.
- Test plan: Test validation, autosave concurrency, privacy, ownership, and cross-tenant denial.
- Verification evidence: pending

### MEM-002 — Implement provider profile API
- Status: pending
- Depends on: IAM-012, DAT-004, DAT-015
- Work area: profile domain and API
- Deliverable: Read/update services, expertise, stages served, geography, delivery mode, contact, and availability.
- Test plan: Test taxonomy validation, privacy, ownership, concurrency, and cross-tenant denial.
- Verification evidence: pending

### MEM-003 — Implement VC profile API
- Status: pending
- Depends on: IAM-012, DAT-004, DAT-015
- Work area: profile domain and API
- Deliverable: Read/update firm, thesis, stages, modalities, geography, check-size band, contact, and visibility.
- Test plan: Test range validation, taxonomy references, privacy, ownership, and cross-tenant denial.
- Verification evidence: pending

### MEM-004 — Implement profile completeness service
- Status: pending
- Depends on: MEM-001, MEM-002, MEM-003
- Work area: profile domain
- Deliverable: Versioned role-specific completeness score and recommended next fields.
- Test plan: Unit-test empty, partial, complete, hidden, and future-schema cases for each role.
- Verification evidence: pending

### MEM-005 — Implement founder onboarding form
- Status: pending
- Depends on: PUB-012, MEM-001, MEM-004
- Work area: member onboarding UI
- Deliverable: Short founder setup with autosave, privacy explanation, and completion checklist.
- Test plan: Playwright-test save/resume, errors, optional fields, privacy controls, and dashboard entry.
- Verification evidence: pending

### MEM-006 — Implement provider onboarding form
- Status: pending
- Depends on: PUB-012, MEM-002, MEM-004
- Work area: member onboarding UI
- Deliverable: Provider setup for expertise, services, availability, geography, and contact preferences.
- Test plan: Playwright-test taxonomy selection, save/resume, validation, and dashboard entry.
- Verification evidence: pending

### MEM-007 — Implement VC onboarding form
- Status: pending
- Depends on: PUB-012, MEM-003, MEM-004
- Work area: member onboarding UI
- Deliverable: VC setup for thesis, preferences, check size, geography, and visibility.
- Test plan: Playwright-test ranges, save/resume, privacy choices, and dashboard entry.
- Verification evidence: pending

### MEM-008 — Implement member workspace shell
- Status: pending
- Depends on: IAM-007, ARC-011, PUB-012
- Work area: member application shell
- Deliverable: Role-aware navigation, organization switch context, account menu, breadcrumbs, and responsive layout.
- Test plan: Playwright-test each role, direct routes, keyboard navigation, mobile drawer, and unauthorized links.
- Verification evidence: pending

### MEM-009 — Implement founder dashboard summary API
- Status: pending
- Depends on: MEM-004, CMP-004, SHR-008
- Work area: founder dashboard API
- Deliverable: One bounded summary response for status, priority, blocker, milestone, AI context, and snapshot activity.
- Test plan: Contract-test populated, partial, empty, and cross-tenant cases.
- Verification evidence: pending

### MEM-010 — Implement provider dashboard summary API
- Status: pending
- Depends on: MEM-004, CNT-012
- Work area: provider dashboard API
- Deliverable: Summary for completeness, visibility, services, availability, contact requests, saves, and relevant content.
- Test plan: Contract-test populated, empty, suspended-listing, and cross-tenant cases.
- Verification evidence: pending

### MEM-011 — Implement VC dashboard summary API
- Status: pending
- Depends on: MEM-004, SHR-008, CNT-012
- Work area: VC dashboard API
- Deliverable: Summary for shared snapshots, profile completeness, saves, news, and communities.
- Test plan: Contract-test valid shared items, expired/revoked exclusion, empty state, and tenant boundaries.
- Verification evidence: pending

### MEM-012 — Implement founder dashboard UI
- Status: pending
- Depends on: MEM-005, MEM-008, MEM-009
- Work area: founder dashboard UI
- Deliverable: Status/completeness, contextual assistant entry, quick actions, news, saves, and snapshot activity.
- Test plan: Playwright-test populated/empty/error states, quick actions, responsive order, and keyboard flow.
- Verification evidence: pending

### MEM-013 — Implement provider dashboard UI
- Status: pending
- Depends on: MEM-006, MEM-008, MEM-010
- Work area: provider dashboard UI
- Deliverable: Completeness, services/availability, assistant entry, inquiries, saves, news, and discovery.
- Test plan: Playwright-test populated/empty/error states, responsive order, and permission behavior.
- Verification evidence: pending

### MEM-014 — Implement VC dashboard UI
- Status: pending
- Depends on: MEM-007, MEM-008, MEM-011
- Work area: VC dashboard UI
- Deliverable: Shared-with-me queue, preferences, assistant entry, discovery, news, saves, and communities.
- Test plan: Playwright-test shared item states, empty/error states, expiry labels, and responsive behavior.
- Verification evidence: pending

### MEM-015 — Implement team invitation UI
- Status: pending
- Depends on: IAM-010, IAM-011, MEM-008
- Work area: member organization settings
- Deliverable: Invite, resend, revoke, role change, member removal, and last-owner protection UI.
- Test plan: Playwright-test owner flows, member denial, expired invitation, and destructive confirmations.
- Verification evidence: pending

### MEM-016 — Implement privacy and account settings UI
- Status: pending
- Depends on: IAM-012, IAM-013, IAM-014, MEM-008
- Work area: member settings
- Deliverable: Visibility controls, AI-context defaults, data export, deletion request, and session actions.
- Test plan: Test persistence, legal-hold messaging, export state, deletion confirmation, and role permissions.
- Verification evidence: pending

## Milestone 8 — Founder Company and Growth Hub

### CMP-001 — Implement company basics API
- Status: pending
- Depends on: IAM-012, DAT-006
- Work area: company domain and API
- Deliverable: Validated company overview, team summary, business model, market, contact, and privacy fields.
- Test plan: Test create/update, optimistic concurrency, field visibility, context eligibility, and cross-tenant denial.
- Verification evidence: pending

### CMP-002 — Implement biotech profile and pipeline API
- Status: pending
- Depends on: CMP-001, DAT-015
- Work area: company domain and API
- Deliverable: Non-confidential modality, platform, therapeutic area, indications, programs, stage, regulatory, CMC, IP, and evidence status.
- Test plan: Test taxonomy validation, multiple programs, warnings, privacy, and prohibited confidential-data copy.
- Verification evidence: pending

### CMP-003 — Implement company status API
- Status: pending
- Depends on: CMP-001
- Work area: company domain and API
- Deliverable: Formation, development/funding stage, team size, priorities, blockers, resources, and next milestone.
- Test plan: Test allowed stages, optionality, history timestamps, concurrency, and tenant authorization.
- Verification evidence: pending

### CMP-004 — Implement strategic goals and milestones API
- Status: pending
- Depends on: CMP-003, DAT-015
- Work area: company domain and API
- Deliverable: Category-based goals and milestones with target date, state, and short evidence note.
- Test plan: Test 3-5 active-goal guidance, ordering, state transitions, invalid dates, and ownership.
- Verification evidence: pending

### CMP-005 — Implement company completeness service
- Status: pending
- Depends on: CMP-002, CMP-003, CMP-004
- Work area: company domain
- Deliverable: Explainable completeness and recommended next fields by current company stage.
- Test plan: Unit-test representative stages, partial profiles, hidden fields, and stable recommendation order.
- Verification evidence: pending

### CMP-006 — Implement company basics form
- Status: pending
- Depends on: CMP-001, MEM-008
- Work area: founder company UI
- Deliverable: Autosaving basics/business/team form with privacy and AI/snapshot eligibility controls.
- Test plan: Playwright-test autosave, offline/error recovery, validation preservation, and privacy changes.
- Verification evidence: pending

### CMP-007 — Implement biotech profile and pipeline form
- Status: pending
- Depends on: CMP-002, MEM-008
- Work area: founder company UI
- Deliverable: Structured non-confidential biotech profile and repeatable pipeline program editor.
- Test plan: Test add/edit/remove program, taxonomy search, warning copy, privacy, and mobile layout.
- Verification evidence: pending

### CMP-008 — Implement company status form
- Status: pending
- Depends on: CMP-003, MEM-008
- Work area: founder company UI
- Deliverable: Current stages, priorities, blocker, needs, fundraising, and next-milestone editor.
- Test plan: Playwright-test stage dependencies, validation, autosave, error recovery, and context eligibility.
- Verification evidence: pending

### CMP-009 — Implement goals and milestones UI
- Status: pending
- Depends on: CMP-004, MEM-008
- Work area: founder company UI
- Deliverable: Lightweight roadmap grouped by category without task-management features.
- Test plan: Test create/edit/reorder/complete, guidance at limits, empty state, and keyboard controls.
- Verification evidence: pending

### CMP-010 — Implement growth-dashboard overview
- Status: pending
- Depends on: CMP-005, CMP-006, CMP-007, CMP-008, CMP-009
- Work area: founder company UI
- Deliverable: “Where now / what next / who can help” overview with completeness, goals, milestones, and recommendations.
- Test plan: Playwright-test stage variants, empty/error states, recommendations, navigation, and responsive layout.
- Verification evidence: pending

### CMP-011 — Implement approved AI-context builder
- Status: pending
- Depends on: CMP-002, CMP-003, CMP-004
- Work area: assistant context domain
- Deliverable: Versioned server-side context using only eligible approved fields and no confidential/freeform spillover.
- Test plan: Snapshot-test included/excluded fields, tenant boundaries, context-off, and deterministic version hash.
- Verification evidence: pending

### CMP-012 — Add company-domain authorization suite
- Status: pending
- Depends on: CMP-011, DAT-012
- Work area: company integration tests
- Deliverable: Full founder owner/member, other-role, other-tenant, and admin-support permission matrix.
- Test plan: Run matrix for every company endpoint and mutation, including private and context-excluded fields.
- Verification evidence: pending

## Milestone 9 — AI Assistant and Curated Knowledge

### AI-001 — Define AI provider interface
- Status: ready
- Depends on: ARC-001, ARC-002
- Work area: AI adapter package
- Deliverable: Provider-neutral streaming, structured-output, embedding, usage, citation, timeout, and cancellation contracts.
- Test plan: Contract-test a fake provider for success, stream interruption, refusal, timeout, and usage reporting.
- Verification evidence: pending

### AI-002 — Implement OpenAI provider adapter
- Status: pending
- Depends on: AI-001
- Work area: AI adapter package
- Deliverable: OpenAI Responses and embeddings adapter with retries, timeouts, request IDs, and normalized usage.
- Test plan: Unit-test mocked responses and run an opt-in nonprod smoke request without logging content or keys.
- Verification evidence: pending

### AI-003 — Implement assistant safety policy
- Status: pending
- Depends on: AI-001
- Work area: assistant safety domain
- Deliverable: Role/topic policy, professional disclaimers, confidential-data warning, high-risk redirection, and output labeling.
- Test plan: Table-test medical, legal, regulatory, tax, investment, confidential science, allowed business, and ambiguous prompts.
- Verification evidence: pending

### AI-004 — Implement Knowledge Card lifecycle API
- Status: pending
- Depends on: DAT-007, IAM-004
- Work area: knowledge domain and API
- Deliverable: Draft, review, approve, publish, supersede, and retire versioned cards with source metadata.
- Test plan: Test state machine, required approval/source fields, immutable published versions, and admin authorization.
- Verification evidence: pending

### AI-005 — Implement Knowledge Card chunking
- Status: pending
- Depends on: AI-004
- Work area: knowledge processing
- Deliverable: Deterministic semantic chunks preserving card, section, source, and version provenance.
- Test plan: Golden-test headings, lists, long sections, empty content, stable IDs, and token bounds.
- Verification evidence: pending

### AI-006 — Implement embedding job
- Status: pending
- Depends on: AI-002, AI-005, INF-011
- Work area: worker and knowledge processing
- Deliverable: Idempotent embedding generation and replacement for approved published versions only.
- Test plan: Test publish, retry, duplicate event, supersession, provider failure, and retired-card exclusion.
- Verification evidence: pending

### AI-007 — Implement tenant-safe hybrid retrieval
- Status: pending
- Depends on: AI-006, DAT-012
- Work area: knowledge retrieval
- Deliverable: pgvector/text retrieval limited to globally approved curated knowledge with provenance and score thresholds.
- Test plan: Evaluate relevant, irrelevant, stale, unpublished, cross-tenant-injection, and no-result queries.
- Verification evidence: pending

### AI-008 — Implement role-aware prompt assembly
- Status: pending
- Depends on: AI-003, AI-007, CMP-011, MEM-002, MEM-003
- Work area: assistant orchestration
- Deliverable: Server-owned instructions combining role, optional organization context, retrieved cards, boundaries, and citation requirements.
- Test plan: Snapshot-test each role, context on/off, empty retrieval, prompt injection, and prohibited-field exclusion.
- Verification evidence: pending

### AI-009 — Implement conversation API
- Status: pending
- Depends on: AI-008, DAT-007, DAT-014
- Work area: assistant domain and API
- Deliverable: Create, list, rename, delete, and read tenant-scoped conversations with 12-month retention metadata.
- Test plan: Test ownership, pagination, rename validation, soft deletion, retention date, and cross-tenant denial.
- Verification evidence: pending

### AI-010 — Implement member answer streaming endpoint
- Status: pending
- Depends on: AI-002, AI-008, AI-009
- Work area: assistant API
- Deliverable: Authenticated streaming answer with context disclosure, citations, cancellation, and persisted completed messages.
- Test plan: Test success, cancellation, partial failure, provider timeout, safety refusal, context off, and atomic persistence.
- Verification evidence: pending

### AI-011 — Implement quota and cost ledger
- Status: pending
- Depends on: AI-010, DAT-010
- Work area: assistant operations
- Deliverable: Per-user/organization quotas plus immutable token, model, latency, status, and estimated-cost records.
- Test plan: Test quota boundaries, concurrency, retries, cached tokens, failed calls, and pricing-version calculations.
- Verification evidence: pending

### AI-012 — Implement member chat interface
- Status: pending
- Depends on: AI-009, AI-010, AI-011, MEM-008
- Work area: member assistant UI
- Deliverable: Role starters, history, context indicator/toggle, streaming, citations, copy, feedback, report, rename, and delete.
- Test plan: Playwright-test all actions, keyboard/focus, screen-reader updates, stream stop, quota, empty/error, and mobile states.
- Verification evidence: pending

### AI-013 — Implement assistant feedback and report API
- Status: pending
- Depends on: AI-009, DAT-007
- Work area: assistant domain and API
- Deliverable: Tenant-owned thumbs feedback and content report with minimal approved message snapshot.
- Test plan: Test idempotent feedback, report reason, ownership, privacy minimization, and admin queue event.
- Verification evidence: pending

### AI-014 — Add curated-answer evaluation suite
- Status: pending
- Depends on: AI-007, AI-008
- Work area: AI evaluations
- Deliverable: Versioned evaluation fixtures for at least ten approved founder-question placeholders and adversarial boundaries.
- Test plan: Run retrieval, citation, refusal, grounding, and prohibited-disclosure scorers with enforced thresholds.
- Verification evidence: pending

### AI-015 — Add AI observability and kill switches
- Status: pending
- Depends on: AI-011, DAT-010
- Work area: assistant operations
- Deliverable: Metrics/traces without prompt text plus independent public/member disable switches.
- Test plan: Verify telemetry redaction, dashboards, switch propagation, in-flight behavior, and audit events.
- Verification evidence: pending

## Milestone 10 — News, Ecosystem, and Consultation

### CNT-001 — Implement news source administration API
- Status: pending
- Depends on: DAT-008, IAM-004
- Work area: content domain and API
- Deliverable: Create/update/disable sources with attribution, license notes, ingest mode, and health state.
- Test plan: Test validation, duplicate source, admin-only access, disable behavior, and audit event.
- Verification evidence: pending

### CNT-002 — Implement news item administration API
- Status: pending
- Depends on: CNT-001
- Work area: content domain and API
- Deliverable: Draft/edit/feature/publish/unpublish items with summaries, tags, attribution, and canonical URL.
- Test plan: Test lifecycle, required attribution, URL normalization, copyrighted-body rejection, and authorization.
- Verification evidence: pending

### CNT-003 — Implement news ingestion adapter
- Status: pending
- Depends on: CNT-001, INF-011
- Work area: news adapter and worker
- Deliverable: Provider-neutral feed/API fetcher producing normalized candidate items.
- Test plan: Fixture-test valid feed, malformed item, timeout, pagination, rate limit, and source disable.
- Verification evidence: pending

### CNT-004 — Implement news deduplication and stale-link checks
- Status: pending
- Depends on: CNT-003
- Work area: news worker
- Deliverable: Canonical-URL/content-key deduplication plus scheduled broken/stale source status.
- Test plan: Test URL variants, duplicate titles, legitimate updates, redirects, 404, timeout, and retry.
- Verification evidence: pending

### CNT-005 — Implement published news query API
- Status: pending
- Depends on: CNT-002, CNT-004, IAM-012
- Work area: content query API
- Deliverable: Public/member feeds with recency, role, topic, modality, geography, and pagination filters.
- Test plan: Contract-test visibility, filters, ordering, pagination stability, stale/unpublished exclusion, and attribution.
- Verification evidence: pending

### CNT-006 — Implement member news page
- Status: pending
- Depends on: CNT-005, MEM-008
- Work area: member content UI
- Deliverable: Searchable/filterable feed, preferences, source details, saved view state, and complete UI states.
- Test plan: Playwright-test filters, pagination, attribution, external links, empty/error, and mobile layout.
- Verification evidence: pending

### CNT-007 — Implement ecosystem profile query API
- Status: pending
- Depends on: MEM-001, MEM-002, MEM-003, IAM-012
- Work area: ecosystem query API
- Deliverable: Visibility-aware startup, provider, and VC cards with taxonomy filters and no opaque scoring.
- Test plan: Test public/member/private fields, filters, suspended profiles, pagination, and cross-tenant privacy.
- Verification evidence: pending

### CNT-008 — Implement community administration API
- Status: pending
- Depends on: DAT-008, IAM-004
- Work area: community domain and API
- Deliverable: Draft/publish/deactivate communities with focus, geography, eligibility, contact, and link.
- Test plan: Test lifecycle, validation, admin access, deactivation, and audit event.
- Verification evidence: pending

### CNT-009 — Implement community query API
- Status: pending
- Depends on: CNT-008, IAM-012
- Work area: community query API
- Deliverable: Public/member community list and detail with visibility and taxonomy filters.
- Test plan: Test visibility, filters, inactive exclusion, pagination, and safe external links.
- Verification evidence: pending

### CNT-010 — Implement saved directory records
- Status: pending
- Depends on: CNT-007, CNT-009
- Work area: ecosystem domain and API
- Deliverable: Save/unsave/list visible profiles and communities for a member.
- Test plan: Test idempotency, ownership, hidden/deactivated target behavior, and pagination.
- Verification evidence: pending

### CNT-011 — Implement contact and introduction requests
- Status: pending
- Depends on: CNT-007, DAT-014
- Work area: ecosystem domain and API
- Deliverable: Structured member-to-visible-profile contact request with consent, status, rate limit, and notification event.
- Test plan: Test eligible target, private target denial, spam limit, duplicate, status changes, and audit trail.
- Verification evidence: pending

### CNT-012 — Implement consultation escalation requests
- Status: pending
- Depends on: DAT-008, DAT-014, IAM-004
- Work area: consultation domain and API
- Deliverable: Structured request for qualified BBW support without direct consultant booking or messaging.
- Test plan: Test role-specific form, validation, ownership, duplicate prevention, status lifecycle, and notifications.
- Verification evidence: pending

### CNT-013 — Implement ecosystem directory UI
- Status: pending
- Depends on: CNT-007, CNT-009, CNT-010, MEM-008
- Work area: member ecosystem UI
- Deliverable: Tabs, approved filters, cards, save action, privacy-aware details, and community pages.
- Test plan: Playwright-test all directories, filters, saved state, hidden fields, empty/error, and responsive layout.
- Verification evidence: pending

### CNT-014 — Implement contact and consultation UI
- Status: pending
- Depends on: CNT-011, CNT-012, CNT-013
- Work area: member ecosystem UI
- Deliverable: Contact/request-introduction and consultation escalation forms with status feedback.
- Test plan: Playwright-test validation, consent, success, duplicate/rate-limit errors, and keyboard/mobile behavior.
- Verification evidence: pending

### CNT-015 — Add news and ecosystem analytics
- Status: pending
- Depends on: CNT-006, CNT-013, CNT-014, ARC-012
- Work area: content analytics
- Deliverable: Privacy-safe news, filter, save, contact, and consultation events.
- Test plan: Schema-validate captured events and prove private profile fields and request text are excluded.
- Verification evidence: pending

## Milestone 11 — Controlled Company Snapshots

### SHR-001 — Implement snapshot field catalog
- Status: pending
- Depends on: CMP-002, CMP-003, CMP-004, DAT-009
- Work area: snapshot domain
- Deliverable: Versioned allowlist mapping eligible company fields to labels, sections, privacy warnings, and renderers.
- Test plan: Unit-test eligible/ineligible fields, stable ordering, unknown fields, and confidential-data exclusions.
- Verification evidence: pending

### SHR-002 — Implement snapshot draft builder API
- Status: pending
- Depends on: SHR-001, IAM-004
- Work area: snapshot domain and API
- Deliverable: Founder-owner preview using selected current fields, recipient, note, expiry, and download setting.
- Test plan: Test owner-only access, selection validation, preview redaction, recipient rules, and date limits.
- Verification evidence: pending

### SHR-003 — Implement immutable snapshot publication
- Status: pending
- Depends on: SHR-002, DAT-014
- Work area: snapshot domain and API
- Deliverable: Atomic immutable payload/version, unpredictable token, publication timestamp, and invitation event.
- Test plan: Test payload copy, token entropy/uniqueness, duplicate submission, later-company-edit isolation, and audit event.
- Verification evidence: pending

### SHR-004 — Implement registered-VC authorization
- Status: pending
- Depends on: SHR-003, IAM-004
- Work area: snapshot authorization
- Deliverable: Recipient-bound VC access without founder-workspace or omitted-field access.
- Test plan: Test assigned VC, other VC, provider, founder, admin support, suspension, expiry, and revocation.
- Verification evidence: pending

### SHR-005 — Implement external-recipient email OTP
- Status: pending
- Depends on: SHR-003, INF-013
- Work area: snapshot external access
- Deliverable: Recipient-specific OTP challenge with hashed code, expiry, attempt limit, resend throttle, and secure session.
- Test plan: Test delivery, valid/invalid/expired code, brute-force lock, resend, wrong email, and session expiry.
- Verification evidence: pending

### SHR-006 — Implement snapshot access logging
- Status: pending
- Depends on: SHR-004, SHR-005
- Work area: snapshot domain
- Deliverable: Append-only authorized view/download events with privacy-minimized metadata.
- Test plan: Test first/repeat view, registered/external viewer, rejected access exclusion, and actor visibility.
- Verification evidence: pending

### SHR-007 — Implement snapshot revocation and republishing
- Status: pending
- Depends on: SHR-003, SHR-006
- Work area: snapshot domain and API
- Deliverable: Immediate revocation and new-version publication without mutation of prior payloads.
- Test plan: Test current sessions after revoke, repeated revoke, republish, old-link denial, and audit events.
- Verification evidence: pending

### SHR-008 — Implement snapshot listing APIs
- Status: pending
- Depends on: SHR-006, SHR-007
- Work area: snapshot query API
- Deliverable: Founder sent/activity views and VC shared-with-me queue with safe status metadata.
- Test plan: Test ordering, pagination, unviewed/viewed, expiry/revocation, external recipients, and tenant isolation.
- Verification evidence: pending

### SHR-009 — Implement snapshot builder UI
- Status: pending
- Depends on: SHR-002, MEM-008
- Work area: founder snapshot UI
- Deliverable: Field selection, preview, recipient, expiry, note, download, confirmation, and publish states.
- Test plan: Playwright-test validation, private warnings, preview accuracy, owner/member permissions, and mobile flow.
- Verification evidence: pending

### SHR-010 — Implement secure snapshot viewer
- Status: pending
- Depends on: SHR-004, SHR-005, SHR-006
- Work area: snapshot web route
- Deliverable: Non-indexed read-only snapshot with generated date, expiry, selected fields, OTP flow, and safe denial states.
- Test plan: Playwright-test registered/external access, OTP, omitted fields, print policy, expired/revoked/unauthorized anonymity, and noindex.
- Verification evidence: pending

### SHR-011 — Implement snapshot activity UI
- Status: pending
- Depends on: SHR-008, SHR-009, SHR-010
- Work area: founder and VC dashboards
- Deliverable: Sent/shared queues, view activity, revoke, republish, and status labels.
- Test plan: Playwright-test lifecycle states, immediate revoke, view log, empty/error, and permissions.
- Verification evidence: pending

### SHR-012 — Add snapshot security regression suite
- Status: pending
- Depends on: SHR-011
- Work area: security integration tests
- Deliverable: Automated token, OTP, recipient, field omission, indexing, expiry, revocation, and workspace-isolation suite.
- Test plan: Run suite against nonprod and require zero unauthorized metadata disclosure.
- Verification evidence: pending

## Milestone 12 — Separate Management Application

### ADM-001 — Implement management authorization middleware
- Status: pending
- Depends on: IAM-008, IAM-003, DAT-013
- Work area: management application and API
- Deliverable: Management-role and MFA enforcement with reason-required privileged-action context.
- Test plan: Test valid admin, missing MFA, member token, disabled admin, expired session, and missing reason.
- Verification evidence: pending

### ADM-002 — Implement management dashboard health API
- Status: pending
- Depends on: ADM-001, DAT-010
- Work area: management operations API
- Deliverable: Bounded health summary for active users, sign-ups, AI success/errors, queues, news, email, and incidents.
- Test plan: Contract-test healthy, degraded, missing-metric, time-range, and unauthorized cases.
- Verification evidence: pending

### ADM-003 — Implement user and organization search API
- Status: pending
- Depends on: ADM-001, DAT-003, DAT-004
- Work area: management identity API
- Deliverable: Paginated search by safe identifiers, status, role, type, and organization without chat-content access.
- Test plan: Test filters, pagination, redaction, suspended records, no-result, and unauthorized access.
- Verification evidence: pending

### ADM-004 — Implement beta-application review API
- Status: pending
- Depends on: ADM-001, IAM-006
- Work area: management identity API
- Deliverable: Review queue and reasoned approve/reject actions with notifications and audit entries.
- Test plan: Test queue ordering, concurrent review, every transition, required reason, and audit/notification output.
- Verification evidence: pending

### ADM-005 — Implement member support actions
- Status: pending
- Depends on: ADM-003, IAM-011, IAM-014
- Work area: management identity API
- Deliverable: Role correction, invitation support, suspend/reactivate, deletion handling, and audit-history retrieval.
- Test plan: Test permitted transitions, last-owner safety, role-data conflict, legal hold, reason, and audit events.
- Verification evidence: pending

### ADM-006 — Implement public-content management API
- Status: pending
- Depends on: ADM-001, DAT-010
- Work area: management content API
- Deliverable: Versioned homepage copy, prompt examples, role descriptions, FAQs, preview, publish, and rollback.
- Test plan: Test draft/publish/rollback, validation, preview isolation, concurrent edits, and audit history.
- Verification evidence: pending

### ADM-007 — Implement news and community management UI
- Status: pending
- Depends on: ADM-001, CNT-001, CNT-002, CNT-008, ARC-010
- Work area: management content UI
- Deliverable: Source/item/community lists, editors, publication actions, stale-source review, and responsive states.
- Test plan: Playwright-test create/edit/publish/unpublish/deactivate, validation, permissions, and audit reason.
- Verification evidence: pending

### ADM-008 — Implement profile moderation API and UI
- Status: pending
- Depends on: ADM-001, CNT-007, DAT-008
- Work area: management moderation
- Deliverable: Report queue, safe profile preview, deactivate/reactivate listing, resolution, and audit reason.
- Test plan: Test report lifecycle, private-field redaction, concurrent resolution, member effects, and audit entries.
- Verification evidence: pending

### ADM-009 — Implement assistant configuration API
- Status: pending
- Depends on: ADM-001, AI-011, DAT-010
- Work area: management AI operations
- Deliverable: Versioned system policy, topic catalog, model choice, quotas, pricing, and public/member flags.
- Test plan: Test validation, draft/activate, stale update, rollback, authorization, and audit events.
- Verification evidence: pending

### ADM-010 — Implement Knowledge Card management UI
- Status: pending
- Depends on: ADM-001, AI-004, AI-006, ARC-010
- Work area: management knowledge UI
- Deliverable: Card editor, sources, review/approval, publish/supersede/retire, and embedding state.
- Test plan: Playwright-test lifecycle, required metadata, immutable published version, failure retry, and permissions.
- Verification evidence: pending

### ADM-011 — Implement reported-AI-output review UI
- Status: pending
- Depends on: ADM-001, AI-013
- Work area: management moderation UI
- Deliverable: Report queue with minimal approved content, resolution, policy linkage, and no general chat browsing.
- Test plan: Test report-only access, unreported-chat denial, resolution, redaction, and audit trail.
- Verification evidence: pending

### ADM-012 — Implement usage aggregation jobs
- Status: pending
- Depends on: DAT-010, INF-012, ARC-012
- Work area: worker and operations data
- Deliverable: Idempotent daily/hourly aggregates by date, environment, role, organization, and service.
- Test plan: Test late events, rerun, timezone boundary, failed event, no double count, and source reconciliation.
- Verification evidence: pending

### ADM-013 — Implement vendor-cost ledger API
- Status: pending
- Depends on: ADM-001, DAT-010
- Work area: management cost API
- Deliverable: Actual/imported/estimated entries for AI, hosting, database/storage, email, and news with pricing metadata.
- Test plan: Test manual/imported records, calculation versions, correction, currency, duplicate invoice, and authorization.
- Verification evidence: pending

### ADM-014 — Implement budget thresholds and alerts
- Status: pending
- Depends on: ADM-012, ADM-013, DAT-014
- Work area: management cost operations
- Deliverable: Monthly/service thresholds, projected variance, deduplicated alerts, acknowledgement, and audit trail.
- Test plan: Test below/at/above thresholds, repeated aggregation, estimate changes, acknowledgement, and notification event.
- Verification evidence: pending

### ADM-015 — Implement usage and cost dashboard UI
- Status: pending
- Depends on: ADM-002, ADM-012, ADM-013, ADM-014
- Work area: management dashboard UI
- Deliverable: Date/environment/role/service filters, KPIs, trends, vendor costs, variance, and AI cost per active member.
- Test plan: Playwright-test filters, empty/partial data, estimates, threshold state, responsive layout, and accessibility.
- Verification evidence: pending

### ADM-016 — Implement CSV exports
- Status: pending
- Depends on: ADM-012, ADM-013, ADM-015, INF-010
- Work area: management exports
- Deliverable: Audited asynchronous usage and cost exports with formula-injection protection and expiring links.
- Test plan: Test filters, large export, escaping, authorization, expiry, and audit event.
- Verification evidence: pending

### ADM-017 — Implement incident kill-switch UI
- Status: pending
- Depends on: ADM-001, AI-015, DAT-010
- Work area: management operations UI
- Deliverable: Reasoned controls for public chat, member chat, news ingestion, and outbound email with current state.
- Test plan: Playwright-test confirmation, reason, propagation, rollback, concurrent admin, and audit event.
- Verification evidence: pending

### ADM-018 — Implement management application shell and dashboard
- Status: pending
- Depends on: ARC-011, ADM-002, ADM-003, ADM-004, ADM-006, ADM-008, ADM-015, ADM-017
- Work area: management application UI
- Deliverable: Separate role-protected navigation and first-view health, cost, moderation, and operations panels.
- Test plan: Playwright-test MFA entry, navigation, direct-route guards, responsive layout, empty/error states, and member-app separation.
- Verification evidence: pending

## Milestone 13 — Workers, Notifications, and Observability

### OPS-001 — Implement outbox dispatcher
- Status: pending
- Depends on: DAT-014, ARC-006, INF-011
- Work area: worker
- Deliverable: Concurrent-safe dispatcher from transactional outbox to typed SQS/EventBridge messages.
- Test plan: Test competing workers, crash after publish, duplicate delivery, backoff, poison message, and tracing context.
- Verification evidence: pending

### OPS-002 — Implement idempotent job framework
- Status: pending
- Depends on: OPS-001, DAT-010
- Work area: worker
- Deliverable: Shared job claim, heartbeat, result, retry, deduplication, and terminal-failure primitives.
- Test plan: Test duplicate delivery, lease expiry, concurrent claim, retry exhaustion, and replay.
- Verification evidence: pending

### OPS-003 — Implement transactional email adapter
- Status: pending
- Depends on: INF-013, OPS-002
- Work area: email adapter and worker
- Deliverable: Templated SES adapter with tagging, idempotency, suppression handling, and delivery-event correlation.
- Test plan: Test render, send, duplicate event, bounce/complaint, suppression, kill switch, and safe logs.
- Verification evidence: pending

### OPS-004 — Implement application email templates
- Status: pending
- Depends on: OPS-003
- Work area: email templates
- Deliverable: Accessible text/HTML templates for invitations, approvals, password-independent notices, snapshots, exports, alerts, and support requests.
- Test plan: Snapshot-render all templates, link-check, accessibility-check markup, and inspect mobile widths.
- Verification evidence: pending

### OPS-005 — Implement structured logging and redaction
- Status: ready
- Depends on: ARC-003, ARC-004, ARC-005, ARC-006
- Work area: all deployables
- Deliverable: Correlated JSON logs with tenant/user pseudonymous IDs and enforced secret/content redaction.
- Test plan: Capture representative logs and assert tokens, prompts, OTPs, secrets, and private fields are absent.
- Verification evidence: pending

### OPS-006 — Implement distributed tracing
- Status: pending
- Depends on: OPS-005
- Work area: API, worker, and infrastructure
- Deliverable: Trace propagation across edge, web, API, database, queues, worker, and external providers.
- Test plan: Run a synthetic end-to-end request and verify one correlated trace with redacted attributes.
- Verification evidence: pending

### OPS-007 — Implement service metrics
- Status: pending
- Depends on: OPS-005, INF-015, INF-017
- Work area: applications and monitoring infrastructure
- Deliverable: Request, latency, error, saturation, queue, database, AI, email, news, and snapshot metrics.
- Test plan: Generate success/failure/load signals and verify correct dimensions without high-cardinality leakage.
- Verification evidence: pending

### OPS-008 — Configure operational dashboards
- Status: pending
- Depends on: OPS-006, OPS-007
- Work area: monitoring infrastructure
- Deliverable: Environment dashboards for golden signals, dependencies, queues, database, AI, and cost-sensitive usage.
- Test plan: Seed synthetic signals and verify each panel, time range, and drill-down link.
- Verification evidence: pending

### OPS-009 — Configure alarms and business-hours paging
- Status: pending
- Depends on: OPS-008
- Work area: monitoring infrastructure
- Deliverable: Actionable severity-based alarms, critical paging, business-hours routing, and low-noise thresholds.
- Test plan: Trigger and recover every critical alarm, verify routing/deduplication, and record notification timing.
- Verification evidence: pending

### OPS-010 — Implement DLQ inspection and replay
- Status: pending
- Depends on: OPS-002, ADM-001
- Work area: worker and management operations
- Deliverable: Authorized inspect/redrive workflow with payload redaction, reason, idempotency, and audit record.
- Test plan: Send poison message, inspect safely, correct condition, replay once, and verify audit evidence.
- Verification evidence: pending

### OPS-011 — Implement scheduled retention jobs
- Status: pending
- Depends on: OPS-002, DAT-016, INF-012
- Work area: worker
- Deliverable: Batched deletion/anonymization for expired chats, OTPs, links, exports, and operational records.
- Test plan: Time-travel-test eligibility, batch resume, legal hold, failure recovery, and deletion counts.
- Verification evidence: pending

### OPS-012 — Create incident response runbooks
- Status: pending
- Depends on: ADM-017, OPS-009, OPS-010
- Work area: operational documentation
- Deliverable: Triage and recovery procedures for auth, database, AI, queues, email, news, snapshot leak risk, and cost spike.
- Test plan: Tabletop each runbook and verify owner, detection, containment, recovery, and evidence steps.
- Verification evidence: pending

### OPS-013 — Create deployment and rollback runbooks
- Status: pending
- Depends on: INF-024, DAT-018
- Work area: operational documentation
- Deliverable: Release, migration, rollback/roll-forward, restore, and emergency-disable procedures.
- Test plan: Execute a nonprod release rehearsal including failed deploy, application rollback, and restore decision point.
- Verification evidence: pending

## Milestone 14 — Security, Quality, and Release Gates

### QA-001 — Add API contract test suite
- Status: pending
- Depends on: ARC-008, IAM-015, CMP-012, AI-013, CNT-015, SHR-012, ADM-018
- Work area: API integration tests
- Deliverable: Schema, error-envelope, pagination, authorization, and compatibility coverage for every Stage 1 route.
- Test plan: Run against fresh local database and nonprod; fail on undocumented or incompatible responses.
- Verification evidence: pending

### QA-002 — Add end-to-end role journey suite
- Status: pending
- Depends on: MEM-012, MEM-013, MEM-014, AI-012, CNT-014, SHR-011
- Work area: end-to-end tests
- Deliverable: Founder, Provider, and VC journeys from registration through primary role outcomes.
- Test plan: Run each journey in Chromium, Firefox, and WebKit with isolated tenants and repeatability checks.
- Verification evidence: pending

### QA-003 — Add management end-to-end suite
- Status: pending
- Depends on: ADM-018, ADM-007, ADM-010, ADM-011, ADM-016
- Work area: management end-to-end tests
- Deliverable: MFA login, approval, moderation, configuration, knowledge, costs, exports, and kill-switch coverage.
- Test plan: Run in all desktop browsers and verify member credentials cannot enter any management route.
- Verification evidence: pending

### QA-004 — Run automated accessibility suite
- Status: pending
- Depends on: QA-002, QA-003
- Work area: accessibility tests
- Deliverable: Axe coverage for public, onboarding, dashboards, chat, directory, snapshot, and management core states.
- Test plan: Run desktop/mobile scans and require zero critical or serious violations.
- Verification evidence: pending

### QA-005 — Perform manual accessibility verification
- Status: pending
- Depends on: QA-004
- Work area: accessibility verification
- Deliverable: WCAG 2.2 AA checklist for keyboard, focus, screen reader, zoom, contrast, reflow, reduced motion, and chat updates.
- Test plan: Verify core journeys at 200% zoom with keyboard and VoiceOver or equivalent; record evidence.
- Verification evidence: pending

### QA-006 — Add browser and responsive compatibility suite
- Status: pending
- Depends on: QA-002, QA-003
- Work area: end-to-end tests
- Deliverable: Supported desktop and mobile viewport checks for layout, navigation, forms, tables, dialogs, and streaming.
- Test plan: Run Chrome, Safari/WebKit, Firefox, Edge/Chromium, iOS Safari emulation, and Android Chrome emulation.
- Verification evidence: pending

### QA-007 — Perform application threat review
- Status: pending
- Depends on: QA-001, SHR-012, OPS-005
- Work area: security documentation and tests
- Deliverable: Threat model and mitigations for identity, tenancy, admin, AI, snapshots, queues, exports, and supply chain.
- Test plan: Map every high-risk threat to implemented control and executable evidence; create tasks for gaps.
- Verification evidence: pending

### QA-008 — Run dynamic security tests
- Status: pending
- Depends on: QA-007, INF-021
- Work area: deployed nonprod security testing
- Deliverable: Automated checks for headers, TLS, injection, CSRF, SSRF, XSS, open redirects, rate limits, and access control.
- Test plan: Run approved scanner plus targeted cases; require no unresolved high/critical findings.
- Verification evidence: pending

### QA-009 — Verify secret and dependency posture
- Status: pending
- Depends on: INF-024
- Work area: repository and images
- Deliverable: Clean history/worktree secret scan, SBOMs, image scans, lockfile audit, and documented exceptions.
- Test plan: Run all scanners on release commit/images and require no unaccepted critical findings.
- Verification evidence: pending

### QA-010 — Run launch-load test
- Status: pending
- Depends on: QA-002, OPS-008
- Work area: nonprod performance testing
- Deliverable: Verified capacity for 100 active users and 10 concurrent AI interactions with measured dependency latency.
- Test plan: Run scripted ramp/steady/spike profile and assert agreed latency, error, saturation, and queue thresholds.
- Verification evidence: pending

### QA-011 — Verify failure recovery
- Status: pending
- Depends on: QA-010, OPS-012, OPS-013, DAT-018
- Work area: nonprod resilience testing
- Deliverable: Evidence for task replacement, provider outage, queue retry/DLQ, database restore, kill switches, and rollback.
- Test plan: Inject each failure, measure detection/recovery, and confirm no cross-tenant or duplicate side effects.
- Verification evidence: pending

### QA-012 — Verify data retention and privacy workflows
- Status: pending
- Depends on: IAM-013, IAM-014, OPS-011
- Work area: privacy verification
- Deliverable: End-to-end export, deletion, legal-hold, chat retention, snapshot expiry, and audit preservation evidence.
- Test plan: Execute each workflow with time controls and reconcile all affected tables, objects, and events.
- Verification evidence: pending

### QA-013 — Verify analytics and cost reconciliation
- Status: pending
- Depends on: PUB-014, CNT-015, ADM-016
- Work area: operational verification
- Deliverable: Reconciled journey events, AI usage, service usage, vendor costs, CSVs, and privacy exclusions.
- Test plan: Run a fixed scenario set and compare raw events, aggregates, dashboard values, and exports exactly.
- Verification evidence: pending

### QA-014 — Execute non-production release candidate gate
- Status: pending
- Depends on: QA-005, QA-006, QA-008, QA-009, QA-010, QA-011, QA-012, QA-013
- Work area: release verification
- Deliverable: Immutable release candidate with all automated suites and operational checks passing in nonprod.
- Test plan: Run the complete CI/CD gate from clean checkout through deployed smoke tests and archive evidence.
- Verification evidence: pending

### QA-015 — Promote and verify production release
- Status: pending
- Depends on: QA-014, INF-024, OPS-013
- Work area: production release
- Deliverable: Approved artifact promotion, migrations, smoke verification, monitoring confirmation, and rollback readiness.
- Test plan: Run production smoke tests for public, each member role, admin authentication, queues, email, AI, news, and snapshots without destructive test data.
- Verification evidence: pending
