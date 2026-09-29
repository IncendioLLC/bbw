# Generated-file ownership policy

Generated files are reproducible projections of a versioned source. They must
not become an undocumented second source of truth.

## Ownership rules

- The team or task that owns a generator and its source inputs also owns its
  generated output, review, tests, and compatibility.
- Change source inputs and generated output together. Never hand-edit generated
  output; regenerate it with the documented command.
- A pull request that changes a generator must either include the regenerated
  output or demonstrate that the output is unchanged.
- Check generated output into Git only when a runtime, deployment, or external
  consumer cannot generate it itself. Build caches, coverage, compiled output,
  and local tool state stay ignored.
- New checked-in generated paths must be added to the inventory below and to
  `.gitattributes`. The owning task must document the source, command, and
  verification method.
- Generated output must be deterministic. CI must regenerate it and fail on a
  diff, or run an equivalent freshness check.
- Forward-only database migrations are durable source artifacts even when a
  tool creates their initial content. Review and own them like handwritten
  code; never regenerate or rewrite a migration that may have been applied.
- Do not place secrets, customer data, confidential scientific data, or PHI in
  generated output or fixtures.

## Checked-in generated artifacts

| Output                                 | Authoritative source                                     | Owner                    | Refresh and verification                                                                                         |
| -------------------------------------- | -------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `pnpm-lock.yaml`                       | Workspace `package.json` files and `pnpm-workspace.yaml` | Repository/tooling owner | Run `pnpm install`; CI uses a frozen lockfile.                                                                   |
| `progress.html` embedded task snapshot | `tasks.md`                                               | Harness coordinator      | Refresh after each task-state transaction and compare task IDs, states, dependencies, and milestone counts.      |
| `apps/api/openapi.json`                | `scripts/openapi/generate-openapi.mjs`                   | API contracts owner      | Run `pnpm openapi:generate`; `pnpm openapi:check` verifies deterministic output and required endpoint responses. |

Future generated OpenAPI clients, API documentation, or schema projections
must be registered here before they are committed.
