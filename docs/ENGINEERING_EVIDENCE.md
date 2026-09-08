# Engineering evidence

This document defines the quantitative claims in the public architecture overview and
keeps repository inventory, verification results, and production state separate.

> **Repository inventory:** generated from the private repository by
> [`metrics/collect.mjs`](../metrics/collect.mjs); the current values are in
> [`metrics/latest.json`](../metrics/latest.json) and in the README table.
>
> **Application source:** private
>
> **Public scope:** measurement method, engineering controls, and explicit non-claims

## Three different facts

| Fact | Where it comes from | What it can support |
|---|---|---|
| **Inventory** (lines, files, declared test cases, migration files, locale keys) | `metrics/collect.mjs` run against the commit named in `metrics/latest.json` | What exists in source at that commit |
| **Verification** (tests executed and passed, type checks, build, audits) | The `scripts/local/testapp` gate run against an exact candidate commit, recorded in the deploy log | Behavior at that commit in that harness |
| **Production state** (deployed candidate, applied migration, health) | The `scripts/local/deploy` receipt and remote read-only checks | What is running, and through which migration |

None of the three is silently promoted into another. An inventory count is never
presented as a passing result; a passing result is never presented as a deployment.

## Inventory method

`collect.mjs` walks `git ls-files` at the product's HEAD and classifies every tracked
file by path and extension. Physical lines are counted, blank lines included, so a file
always counts the same way regardless of formatting. Application source, automated
tests, migrations, and infrastructure are added into one code total; documentation is
reported and excluded from it; dependencies, lockfiles, build output, binaries, database
backups, XML and CSV data, large JSON datasets, and design-canvas exports are excluded
from everything. The full rules and the way to reproduce a measurement are in
[`metrics/README.md`](../metrics/README.md).

Declared test cases are counted from source (`it(` and `test(` calls). Parameterized
tables count once and expand when Vitest runs, so the runner's total is higher than the
declared count. The declared count is the floor; the gate below is the runner's number.

## Last full verification gate

The most recent complete gate before a production deploy, taken from the deploy log:

| Date | Candidate | Backend (Worker/runtime + D1) | Dashboard | Also required |
|---|---|---|---|---|
| 2026-09-06 | `ee5a0a4b60b3` | 392 files, **3,710 tests passed** | 92 files, **935 tests passed** (4 skipped) | Two TypeScript compile gates, dashboard production build, five-catalog locale audit, readiness probes |

The candidate was pushed to `main` and deployed with `scripts/local/deploy`; migration
0113 was applied and both public health checks passed. A later commit added migration
0114 locally; the README inventory counts what is in source, and the deploy receipt
records what production has applied.

## Migration state

Migrations are forward-only, sequentially numbered SQL files applied through Wrangler
to D1. Three statements are kept distinct:

- **in the tree** describes schema history that exists in source (the README count);
- **rehearsed locally** describes a replay on a disposable database, which the D1 test
  project does on every run by seeding each Miniflare instance from one migrated
  snapshot;
- **applied remotely** describes an environment mutation, recorded per deploy.

## What gates an application change

| Gate | Purpose |
|---|---|
| Contract and threat-boundary review | Defines tenant, authorization, publication, retention, provider, and failure semantics before implementation |
| Worker and test TypeScript projects | Reject incompatible runtime and test contracts |
| Dashboard typecheck and production build | Reject SPA type and build regressions separately from Worker state |
| Vitest unit, component, integration, and D1 projects | Prove behavior at the narrowest relevant boundary, including cross-tenant and failure cases |
| Five-catalog localization audit | Fails on missing or orphaned operator-facing content; currently 3,178 keys in each of five catalogs with zero missing and zero orphaned |
| Migration replay and integrity checks | Exercise forward history on disposable data before any remote application |
| Readiness probes | Validate environment-specific bindings and fail-closed configuration |
| Exact-commit release receipt | Rejects dirty, diverged, changed, or previously tested but no longer current candidates |

## Evidence lanes stay separate

| Observation | What it can prove | What it cannot prove |
|---|---|---|
| Unit/component pass | Local contract behavior | D1, provider, browser, or production behavior |
| SQLite migration replay | SQL ordering, integrity, and selected constraints | Miniflare parity or remote application |
| Miniflare/D1 pass | D1-backed application behavior in that harness | Production state |
| Production build | Compilable, bundleable frontend | Rendered UX or live deployment |
| Browser check | Visible behavior in the captured build and session | Unseen devices, routes, or environments |
| Provider probe | That provider path at that time | Durable availability or unrelated providers |
| Remote read-only check | Observed remote state | Authorization to mutate it |
| Exact-HEAD deployment receipt | Candidate identity and completed release gate | Health of a different commit |

A setup timeout before assertions is unverified evidence and is never recorded as a pass. A focused pass is reported as focused. A local implementation is described as local until it is deployed.

## Explicit non-claims

- The application source is not public; this repository is an architecture and
  evidence pack.
- BotAnswer is in open beta with self-serve sign-up. That describes access; it makes no
  general-availability or uptime claim.
- The README inventory is what exists in source at the named commit. It is not a
  coverage percentage and not an all-green assertion; the gate table above is the
  passing result.
- The migration count in the README is the number of migration files in source, not
  the number applied to production.
- Native iOS and Android clients are on the roadmap and have not been built.
- Provider fallback is configured and ordered; automatic health- or quality-based
  routing is not claimed. Live AI answers are an activation-gated mode per tenant.
- Production website ingestion uses a separate direct OpenAI fallback seam; it is not
  counted as traffic through the customer router.
- Automated bank-settlement verification is not claimed.
- Deterministic-ingestion coverage and fallback-rate instrumentation remain work to do.

## AI-assisted development

AI accelerates implementation inside a spec-first workflow. Raymond J. Kraft owns the
domain model, architecture, review, test design, release decisions, and production
operations. Generated changes receive no exemption from the evidence gates above.

[← Back to the architecture overview](../README.md)
