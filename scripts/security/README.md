# Repository security checks

Run the complete local/CI security gate from the repository root:

```sh
node scripts/security/run-security-checks.mjs
```

The gate performs three checks:

1. High-confidence secret patterns in files eligible to enter Git.
2. Prohibited credential, private-key, environment, local-database, and keystore files.
3. A `pnpm audit --audit-level high` vulnerability audit of the lockfile.

Run an individual repository check with either `--secrets` or `--prohibited`:

```sh
node scripts/security/scan-repository.mjs --secrets
node scripts/security/scan-repository.mjs --prohibited
```

The default scan includes tracked files and unignored untracked files, matching
the files that could enter a commit. To investigate a specific file or directory,
including ignored local files, add `--path PATH`.

Environment templates may use `.env.example`, `.env.sample`, or `.env.template`.
They must contain placeholders rather than working credentials.
