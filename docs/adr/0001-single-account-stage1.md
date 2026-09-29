# ADR-0001: Single AWS account for Stage 1

- Status: accepted
- Date: 2026-09-27
- Supersedes: initial three-account Stage 1 deployment target

## Context

The original infrastructure plan separated management, non-production, and production into AWS Organizations accounts. The owner wants to defer environment isolation so Stage 1 can proceed in the currently owned AWS account.

## Decision

Stage 1 uses one AWS account and one `stage1` environment in `us-east-1`. The CDK, bootstrap schema, naming policy, and deployment contracts keep an explicit environment/account boundary so Stage 2/3 can add separate accounts without rewriting application or infrastructure interfaces. Management authorization remains a separate application surface even though it shares the account during Stage 1.

## Consequences

Stage 1 has lower setup overhead but reduced blast-radius isolation. Production-grade controls still apply within the account: private subnets, least-privilege roles, encryption, backups, WAF, audit logging, and deployment approvals. A later isolation task must introduce Organizations accounts and promotion boundaries before production scale-up.
