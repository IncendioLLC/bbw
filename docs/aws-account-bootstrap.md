# AWS account bootstrap prerequisites

Stage 1 uses one AWS account and one `stage1` environment in `us-east-1`. Environment isolation through AWS Organizations is deferred to a later milestone. The account ID and role name are supplied through deployment secrets or environment variables; they are never committed to the repository.

Before deploying CDK, the platform owner must:

1. Designate the current account as the Stage 1 account.
2. Bootstrap it with the pinned CDK CLI: `cdk bootstrap aws://ACCOUNT_ID/us-east-1`.
3. Create a deployment role named `BbwGithubActionsDeploy`. Trust is restricted to the GitHub Actions OIDC provider, repository, and approved branch/environment claims.
4. Grant the role only the deployment permissions required by the CDK stacks.
5. Verify from a read-only operator session with `aws sts get-caller-identity` and record the account ID out of band.

The local schema in `infra/src/bootstrap.ts` validates the Stage 1 12-digit account ID, role-name format, and fixed region before a deployment workflow can proceed. No credentials, account IDs, or secret values belong in source control.

SES and GitHub OIDC are opt-in until their owner-controlled domain and repository exist. Leave `BBW_ENABLE_SES` and `BBW_ENABLE_GITHUB_OIDC` unset for the database/network deployment. Enable them only with the corresponding `BBW_SES_DOMAIN` and `BBW_GITHUB_REPOSITORY` values.
