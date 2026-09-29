# Local development services

The local stack provides production-shaped dependencies without using cloud
credentials or sending email outside the workstation:

- PostgreSQL 17 with pgvector 0.8.6 at `127.0.0.1:5432`.
- Mailpit SMTP capture at `127.0.0.1:1025` and its UI at
  <http://127.0.0.1:8025>.
- LocalStack at `http://127.0.0.1:4566` for S3, SQS, DynamoDB, and EventBridge.

All published ports bind only to loopback. The Compose defaults are obvious
local-only values, not production credentials. Copy `.env.example` to the
ignored `.env.local` only when overrides are needed; Docker Compose reads
`.env`, so export values from `.env.local` before starting if you customize
them.

## Commands

From the repository root:

```sh
scripts/local-services.sh start
scripts/local-services.sh health
scripts/local-services.sh status
scripts/local-services.sh stop
```

`start` validates the Compose model, waits for every container health check,
then independently verifies the vector extension, Mailpit readiness, and all
four emulated AWS APIs. `stop` removes the containers and network cleanly but
keeps the PostgreSQL and Mailpit named volumes.

To inspect service output after a failure:

```sh
docker compose logs postgres mailpit localstack
```

If a previously created PostgreSQL volume predates the vector initialization,
apply `CREATE EXTENSION IF NOT EXISTS vector;` to that database or explicitly
remove the `bbw-local_postgres-data` volume after confirming its contents are
disposable.
