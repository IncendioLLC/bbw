# Stage 1 artifact promotion

`.github/workflows/promote-stage1.yml` is the Stage 1 promotion contract. It is deliberately split into two paths:

- A dry run validates an immutable commit SHA against a successful `deploy-stage1.yml` run, checks the OIDC deployment identity, confirms all four ECS services are stable, exercises the ALB host-isolation smoke checks, and prints exact ECS rollback commands.
- A real promotion is protected by the `stage1-promotion` GitHub environment. It currently fails closed after approval because Stage 1 uses one AWS account and no production target exists yet. The job is the extension point for the later multi-account promotion implementation.

## One-time GitHub setup

Create the `stage1-promotion` environment in repository settings and add the platform owner as a required reviewer. Restrict deployments to the `main` branch. Do not add long-lived AWS credentials; the workflow assumes `BbwGithubActionsDeploy` through OIDC.

## Dry-run command

Use a completed successful `deploy-stage1.yml` run and its commit SHA:

```sh
gh workflow run promote-stage1.yml \
  --repo IncendioLLC/bbw \
  -f source_run_id=36760481219 \
  -f artifact_sha=0123456789abcdef0123456789abcdef01234567 \
  -f dry_run=true
```

The SHA must be the exact 40-character `head_sha` from the source run. The dry run never changes ECS or CloudFormation state.

## Future promotion contract

When production accounts and their OIDC trust are provisioned, replace only the fail-closed `promote` job body. Keep the immutable SHA/provenance check, environment approval, smoke checks, and rollback output unchanged. Promotion must deploy the already-validated artifact and must not rebuild from a mutable branch.
