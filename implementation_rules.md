# BBW Stage 1 Implementation Rules

These rules govern agent-driven implementation of the Stage 1 platform. `tasks.md` is the authoritative execution backlog. `current_status.md` is the concise implementation handoff. `progress.html` is a read-only projection of the backlog.

## 1. Requirement authority

Use requirements in this order when sources disagree:

1. The latest approved AWS technical plan: AWS Organizations, ECS Fargate, separate public/member and management applications, Fastify API, worker, RDS PostgreSQL 17, Cognito, CDK, and GitHub Actions OIDC.
2. `doc/BBW_Platform_Owner_Questionnaire_092226.docx` for business requirements, terminology, taxonomies, content boundaries, and curated RAG.
3. `doc/BBW_Stage_1_Product_Design.docx` for Stage 1 product behavior and UX where it does not conflict with later decisions.
4. The SOW and strategic proposal as historical context only.

The AWS plan supersedes the older Vercel/Supabase recommendation. Curated, owner-approved Knowledge Cards and FAQs are in scope; arbitrary user-document ingestion is not.

## 2. Task states

Only these states are valid:

- `pending`: has one or more unresolved dependencies.
- `ready`: has no unresolved dependencies and may be claimed.
- `in_progress`: claimed by exactly one agent and currently being implemented.
- `blocked`: cannot be completed because of a concrete external or technical blocker.
- `complete`: implementation and the stated test plan have both been verified.

Allowed transitions are `pending -> ready`, `ready -> in_progress`, `in_progress -> complete`, and `in_progress -> blocked`. A blocked task returns to `ready` only after its blocker is removed. Reopening a completed task requires a written reason in its verification evidence.

## 3. Selecting and claiming work

1. Read this file, then `current_status.md`, then the selected record in `tasks.md` before changing product files. Use the summary to avoid scanning unrelated code, but inspect the selected task's affected files and contracts.
2. Select only tasks with `Status: ready` and `Depends on: none`.
3. Confirm the task's work area does not overlap another active task.
4. The coordinator changes the task to `in_progress` and records the assignee before implementation begins.
5. An ordinary task should take 1-4 focused hours. Split it before implementation if it is larger, has multiple independent outcomes, or cannot be verified with one coherent test plan.
6. Do not perform unrelated cleanup. Discovered work becomes a new task with explicit dependencies.

## 4. Parallel agents

- At most five agents may be active, including the coordinator. A lower runtime concurrency limit always wins; the current runtime permits four active agents.
- Parallel tasks must have no dependency relationship and no overlapping file ownership, database migration sequence, infrastructure stack, generated artifact, or shared mutable resource.
- The coordinator alone edits `tasks.md`, `current_status.md`, and the progress snapshot in `progress.html`. Subagents report status deltas; they do not update the harness.
- Before delegation, the coordinator gives each agent the task ID, allowed work area, acceptance condition, and required tests.
- If overlap or conflicting assumptions appear, pause the affected tasks and resolve ownership before continuing.

## 5. Implementation requirements

- Preserve `demo/` as read-only reference material.
- Keep tenant authorization on the server and in PostgreSQL RLS; never rely on client filtering.
- Keep provider-specific code behind adapters and domain interfaces.
- Validate external input with shared Zod schemas and return documented API errors.
- Use forward-only Drizzle migrations. Never rewrite a migration that may have been applied.
- Keep secrets out of source control, logs, fixtures, screenshots, and task evidence.
- Do not introduce PHI, confidential scientific data, or proprietary drug-discovery content into fixtures or prompts.
- Add or update tests in the same task as behavior changes unless the task is explicitly a test-only integration gate.
- Preserve Stage 2/3 extension boundaries: organization tenancy, provider adapters, usage ledgers, stable contracts, and separate management authorization.

## 6. Verification and completion

An agent completion report must include:

- Task ID.
- Files changed.
- Commands and checks run.
- Result of every test-plan item.
- Any assumptions, follow-up risks, or newly discovered tasks.
- A concise status delta: capabilities now available, important files/interfaces added or changed, database/infrastructure/configuration changes, verification state, limitations, and recommended next work.

The coordinator then:

1. Reviews the diff and confirms it stays inside the task.
2. Runs the task's stated test plan or independently verifies equivalent evidence.
3. Runs relevant regression checks for affected packages.
4. Refuses completion if tests were skipped, are failing, are flaky without resolution, or do not prove the deliverable.
5. Sets `Status: complete`, records concise verification evidence, and clears the assignee.
6. Finds every incomplete task containing the completed ID in `Depends on` and removes that ID.
7. Changes a dependent task from `pending` to `ready` when its dependency list becomes empty; write `Depends on: none`.
8. Updates `current_status.md`: counts, phase, implementation-state table, active/ready/blocked work, interfaces and data changes, verification state, risks, resume guidance, and recent completions.
9. Refreshes the embedded snapshot in `progress.html` and its synchronization timestamp.
10. Validates task IDs, dependencies, states, summary counts, dashboard data, and graph acyclicity before scheduling more work.

Task completion is one coordinator transaction: `tasks.md`, `current_status.md`, and `progress.html` must agree before another task is claimed.

Git history preserves removed prerequisites. `Depends on` intentionally lists only unresolved prerequisites.

## 7. Status-summary discipline

- `current_status.md` contains current system truth, not a diary or a copy of task descriptions.
- Keep it concise enough for a fresh agent to read before every task.
- Replace stale statements instead of appending contradictory history.
- Record only implemented and verified behavior as available. Planned behavior belongs in `tasks.md`.
- Name important entrypoints, commands, contracts, migrations, environment variables, cloud resources, and operational limitations introduced by completed work.
- Keep its active, ready, and blocked lists and status counts synchronized with `tasks.md`.
- Keep at most ten recent-completion summaries. Each includes task ID, outcome, verification, and any handoff warning.
- Update it after completed, blocked, unblocked, or materially replanned tasks and architecture decisions affecting later work.
- If code and the summary disagree, code/tests are factual, `tasks.md` controls scheduling, and the coordinator corrects `current_status.md` immediately.

## 8. Blocking and failure handling

- `blocked` requires a concrete reason, evidence of attempted resolution, and the condition that will unblock it.
- A missing credential or owner decision blocks only the smallest affected task; continue other ready tasks.
- Failed tests keep the task `in_progress` unless progress is impossible without an external change.
- Never weaken assertions, authorization, accessibility checks, security controls, or quality thresholds merely to complete a task.
- If a completed task later causes a regression, create a repair task, link it to the affected acceptance gate, and mark downstream gates blocked when appropriate.

## 9. Progress dashboard

- `tasks.md` is authoritative; `progress.html` never changes task state.
- Refresh the dashboard after every status or dependency update.
- The HTML must remain self-contained, work without a build step, and open via `file://`.
- The embedded task snapshot must match `tasks.md`. The dashboard may also import a newer local `tasks.md` through its file picker for immediate read-only viewing.
- Verify total and per-status counts after every refresh.
- Verify every task retains its milestone assignment and that per-milestone counts match `tasks.md`.

## 10. Definition of engineering complete

Stage 1 engineering is complete only when every task is `complete`, all release gates pass, production rollback and restore procedures have been exercised, tenant-isolation tests pass, critical accessibility paths pass, and the production smoke suite passes. Business-owned brand, legal, editorial, and launch-content approval remains outside this engineering graph.
