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

Allowed transitions are `pending -> ready`, `ready -> in_progress`, `in_progress -> complete`, and `in_progress -> blocked`. `in_progress -> ready` is allowed only when the user explicitly interrupts, cancels, or reassigns the work; the handoff must state what changed and whether partial changes remain. A blocked task returns to `ready` only after its blocker is removed. Reopening a completed task requires a written reason in its verification evidence.

`in_progress` means an agent or an active command is working on the task now. It is not a parking state. A task must not remain `in_progress` after the responsible agent sends its final response, stops working, or becomes unavailable.

## 3. Selecting and claiming work

1. Read this file, then `current_status.md`, then the selected record in `tasks.md` before changing product files. Use the summary to avoid scanning unrelated code, but inspect the selected task's affected files and contracts.
2. Select only tasks with `Status: ready` and `Depends on: none`.
3. Confirm the task's work area does not overlap another active task.
4. The coordinator changes the task to `in_progress` and records the assignee before implementation begins.
5. An ordinary task should take 1-4 focused hours. Split it before implementation if it is larger, has multiple independent outcomes, or cannot be verified with one coherent test plan.
6. Do not perform unrelated cleanup. Discovered work becomes a new task with explicit dependencies.
7. Before claiming an infrastructure or external-integration task, run a readiness preflight: confirm required credentials, account and region, owner decisions, DNS or repository prerequisites, live resource names, CloudFormation ownership, and whether another deployment is active. If an owner-only prerequisite is missing, block only that task immediately and select another ready task.
8. Before implementation, translate the deliverable and test plan into a short acceptance checklist. Confirm that every behavior being tested is actually implemented. Missing application behavior is implementation work inside the task, not a verification blocker.

## 4. Parallel agents

- At most five agents may be active, including the coordinator. A lower runtime concurrency limit always wins; the current runtime permits four active agents.
- Parallel tasks must have no dependency relationship and no overlapping file ownership, database migration sequence, infrastructure stack, generated artifact, or shared mutable resource.
- The coordinator alone edits `tasks.md`, `current_status.md`, and the progress snapshot in `progress.html`. Subagents report status deltas; they do not update the harness.
- Before delegation, the coordinator gives each agent the task ID, allowed work area, acceptance condition, and required tests.
- If overlap or conflicting assumptions appear, pause the affected tasks and resolve ownership before continuing.
- Every `in_progress` task must map to one live agent or one active command. The coordinator audits this mapping before each status report. If no worker exists, the task is immediately resumed by the coordinator or moved to a truthful terminal state for the turn.
- Deployments that mutate the same CloudFormation stack, ECS service, migration sequence, or shared environment must be serialized even when their source tasks are otherwise independent.

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

The completion transaction must also run a global dependency audit, not only inspect the task just completed:

- No incomplete task may list a completed task in `Depends on`.
- Every `pending` task must have at least one unresolved dependency.
- Every `ready` task must say `Depends on: none`.
- Every `in_progress` task must have a live owner.
- Counts in `tasks.md`, `current_status.md`, and `progress.html` must match exactly.

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
- `blocked` is reserved for a dependency the agent cannot satisfy itself, such as owner approval, unavailable credentials, DNS ownership, third-party account action, or a confirmed provider/platform condition. A bug, missing code, failed test, unfamiliar AWS behavior, or slow verification is not by itself a blocker.
- A missing credential or owner decision blocks only the smallest affected task; continue other ready tasks.
- Failed tests keep the task `in_progress` unless progress is impossible without an external change.
- When verification fails, first determine whether the cause is missing implementation, incorrect configuration, stale live state, resource ownership, permissions, or a faulty test. Fix the cause and rerun the full test plan; do not report the failure as the task outcome while an autonomous corrective action remains.
- Long-running cloud operations must use bounded polling with periodic diagnostics. Continue polling or diagnose and recover within the same working turn. Do not stop merely because ECS, CloudFormation, ACM, SES, DNS, or GitHub Actions is still converging.
- Before any infrastructure deployment, inspect the target stack and resource ownership. Reuse or import existing resources when they are intended to be managed by the stack. Never allow overlapping deployments to the same stack; wait for, safely cancel, or recover the earlier operation before continuing.
- A blocked record must name exactly what the user must do, where to do it, the expected result, and the command or check the agent will run afterward. Once the user reports completion, the agent verifies it and resumes automatically.
- Never weaken assertions, authorization, accessibility checks, security controls, or quality thresholds merely to complete a task.
- If a completed task later causes a regression, create a repair task, link it to the affected acceptance gate, and mark downstream gates blocked when appropriate.
- When the recorded blocker is resolved, the coordinator must verify the unblock condition, change the task from `blocked` to `ready`, remove or update the blocker evidence, refresh `current_status.md` and `progress.html`, and automatically resume the next eligible ready task without waiting for a new user prompt. The coordinator must continue through the active milestone until its completion boundary or a new concrete blocker is reached.

## 9. Autonomous milestone execution loop

When the user asks to continue through a milestone, that instruction remains active until the milestone is complete or genuinely blocked. The coordinator repeats this loop without waiting for another prompt:

1. Reconcile all dependencies and task states globally.
2. Claim one or more non-overlapping ready tasks in the active milestone.
3. Implement every item in each task's acceptance checklist.
4. Run the complete test plan and relevant regression checks.
5. Fix failures and repeat verification while an autonomous path remains.
6. Complete the atomic harness transaction for every verified task.
7. Promote newly dependency-free tasks and immediately claim the next eligible work.
8. Recalculate milestone status and continue from step 1.

The agent may stop and send a final report only when one of these conditions is true:

- Every task in the requested milestone is `complete`.
- All unfinished tasks in that milestone are `blocked`, each blocker requires external human action, and no other ready task in the milestone can progress.
- The user explicitly pauses, cancels, or changes the scope.

Before stopping, there must be no orphaned `in_progress` task. An actively running remote job may remain `in_progress` only while the agent continues monitoring it; if work is being handed back to the user, record a truthful blocker or complete the verification first.

## 10. Progress dashboard

- `tasks.md` is authoritative; `progress.html` never changes task state.
- Refresh the dashboard after every status or dependency update.
- The HTML must remain self-contained, work without a build step, and open via `file://`.
- The embedded task snapshot must match `tasks.md`. The dashboard may also import a newer local `tasks.md` through its file picker for immediate read-only viewing.
- Verify total and per-status counts after every refresh.
- Verify every task retains its milestone assignment and that per-milestone counts match `tasks.md`.

## 11. Definition of engineering complete

Stage 1 engineering is complete only when every task is `complete`, all release gates pass, production rollback and restore procedures have been exercised, tenant-isolation tests pass, critical accessibility paths pass, and the production smoke suite passes. Business-owned brand, legal, editorial, and launch-content approval remains outside this engineering graph.
