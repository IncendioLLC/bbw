# Dependency license policy

BBW may use dependencies only when their declared SPDX license is in
[`config/license-policy.json`](./config/license-policy.json). The initial
allowlist contains permissive licenses suitable for a publicly distributed
commercial product. Missing, malformed, proprietary, copyleft, source-available,
and unreviewed licenses fail closed.

Run the check after installing the workspace:

```sh
node scripts/check-licenses.mjs
```

The checker starts from every workspace manifest, follows installed production,
development, and optional dependency trees, and validates each package's
license expression. First-party workspace packages are not treated as external
dependencies. Missing platform-specific optional dependencies are ignored;
missing required dependencies fail with an instruction to install first. For an
SPDX `OR` expression, at least one choice must be allowed. Every part of an
`AND` expression must be allowed. An SPDX exception following `WITH` must also
appear in the policy's separate exception allowlist.

Do not expand the allowlist only to make CI pass. A proposed license must receive
legal or owner approval for BBW's planned distribution model, and the approval
must be documented in the same change. Dependencies with custom licenses require
review and must not be represented as an inaccurate SPDX license.

Tests can supply an isolated report without modifying installed packages:

```sh
node scripts/check-licenses.mjs --fixture path/to/license-report.json
```

The report format is:

```json
{
  "packages": [{ "name": "example", "version": "1.0.0", "license": "MIT" }]
}
```

Use `--fixture -` to read that JSON from standard input. This fixture mode is
for checker tests only and must not replace the installed-dependency check in CI.
