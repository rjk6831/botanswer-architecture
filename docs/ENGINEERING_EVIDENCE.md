# Engineering evidence

This document defines the quantitative claims in the public architecture overview
and keeps codebase inventory separate from verification and production state.

> **Repository inventory refreshed:** 27 August 2026
>
> **Application source:** private
>
> **Public scope:** measurement method, engineering controls, and explicit non-claims

## Dated snapshot

| Measure | Snapshot | What it means |
|---|---:|---|
| Current WIP test inventory | **3,185 cases across 345 test files** | Structured Vitest collection on 27 August 2026. It is not presented as a fresh full-suite pass. |
| Last complete green test checkpoint | **2,576 passing cases across 274 test files** | Separate Worker/runtime and dashboard lanes at commit `90cd31e63432`. |
| Current repository maintenance surface | **363,798 lines across 1,218 files** | Supplied 27 August extension scan covering application source, tests, migrations, documentation, and supporting configuration. |
| Prior clean committed engineering baseline | **198,917 lines** | Narrower TypeScript, TSX, and SQL baseline at commit `e09c5e2088f3`; retained for history and not directly comparable to the broad current count. |
| 24 August WIP migration inventory | **73 sequentially numbered files** | 70 were committed at the captured application HEAD (`e09c5e2088f3`) and 3 were additional WIP files; this does not imply remote application. |
| Production D1 checkpoint | **0068 applied** | Last remote read-only confirmation in the snapshot evidence. |
| Localization checkpoint | **2,099 keys in each of 5 catalogs** | Last recorded complete catalog audit, not a live recount of later local work. |

## Line-count method

The supplied extension scan reported **363,798 physical lines across 1,218 files**.
The overview rounds this to **approximately 364,000 repository lines**.
Its scope intentionally includes application source, automated tests, SQL migrations,
documentation, and supporting configuration, while excluding dependencies and binary
assets.

This is a broad maintenance-surface measure, not semantic source lines of code and not
a productivity or quality claim. It should not be compared directly with the older
198,917-line clean baseline, which counted only TypeScript, TSX, and SQL after removing
a generated database backup.

## Test-count method and checkpoint

Structured Vitest collection on 27 August 2026 found **3,185 cases across 345 test
files**:

- Worker/runtime unit project: **2,341 cases across 223 files**
- D1 project: **352 cases across 65 files**
- Dashboard project: **492 cases across 57 files**

Collection enumerates the cases that exist without executing them. The exact inventory
is therefore not presented as an all-green test result.

The most recent fully recorded two-lane checkpoint before this snapshot was commit
`90cd31e63432`:

- Worker/runtime: **226 files / 2,177 tests passed**
- Dashboard: **48 files / 399 tests passed**
- Combined at that checkpoint: **274 files / 2,576 tests passed**

Later focused work increased the inventory. The approximate captured figure describes
what exists in the work-in-progress suite; it does not relabel focused runs as a new
complete pass. The strongest simple green-floor claim remains **2,500+ automated
tests**.

## Migration state is two different facts

The captured private working tree contained **73 sequentially numbered migration
files**: 70 committed at the captured application HEAD (`e09c5e2088f3`) and three
additional WIP files. Production was independently confirmed through **0068**.
Migrations 0069 and later were local or otherwise outside that production confirmation
at snapshot time.

That distinction is intentional:

- **in the tree** describes schema history that exists in source;
- **rehearsed locally** describes a disposable-database result;
- **applied remotely** describes an environment mutation; and
- **deployed behavior** additionally requires the matching application candidate.

None is silently promoted into another.

## What gates an application change

| Gate | Purpose |
|---|---|
| Contract and threat-boundary review | Defines tenant, authorization, publication, retention, provider, and failure semantics before implementation |
| Worker and test TypeScript projects | Reject incompatible runtime and test contracts |
| Dashboard typecheck and production build | Reject SPA type/build regressions separately from Worker state |
| Vitest unit, component, integration, and D1 lanes | Prove behavior at the narrowest relevant boundary, including cross-tenant and failure cases |
| Five-catalog localization audit | Fails on missing or orphaned operator-facing content |
| Migration replay and integrity checks | Exercises forward history on disposable data before any remote application |
| Readiness probes | Validate environment-specific bindings and fail-closed configuration |
| Exact-commit release receipt | Rejects dirty, diverged, changed, or previously tested-but-no-longer-current candidates |

## Evidence lanes stay separate

| Observation | What it can prove | What it cannot prove |
|---|---|---|
| Unit/component pass | Local contract behavior | D1, provider, browser, or production behavior |
| SQLite migration replay | SQL ordering, integrity, and selected constraints | Miniflare parity or remote application |
| Miniflare/D1 pass | D1-backed application behavior in that harness | Production state |
| Production build | Compilable/bundleable frontend | Rendered UX or live deployment |
| Browser check | Visible behavior in the captured build/session | Unseen devices, routes, or environments |
| Provider probe | That provider path at that time | Durable availability or unrelated providers |
| Remote read-only check | Observed remote state | Authorization to mutate it |
| Exact-HEAD deployment receipt | Candidate identity and completed release gate | Health of a different commit |

A setup timeout before assertions is unverified evidence, not a pass. A focused pass is
reported as focused. A local implementation is not described as deployed.

## Explicit non-claims

- The application source is not public; this repository is an architecture and
  evidence pack.
- BotAnswer is a deployed **private beta**, not a general-availability claim.
- 3,185 is current collected test inventory, not coverage percentage or an all-green
  assertion.
- 73 migration files in the captured tree does not mean 73 migrations were applied to production.
- A locally implemented payment-proof review path requires authorized operator
  confirmation; production deployment and live UAT remain pending. Automated
  bank-settlement verification is not claimed.
- Rich Menu editing/composition is part of the deployed product surface; the repaired
  native publication path still requires production deployment and live LINE UAT.
- Native iOS and Android clients are planned, not built.
- Provider fallback is configured and ordered; automatic health/quality-based routing
  is not claimed. Customer provider and generative modes are disabled in the deployed
  beta, so the implemented three-provider customer router is not presented as active.
- Production website ingestion uses a separate direct OpenAI fallback seam; it is not
  silently counted as traffic through the inactive customer router.
- Deterministic-ingestion coverage and fallback-rate instrumentation remain work to do.

## AI-assisted development

AI accelerates implementation inside a spec-first workflow. Raymond J. Kraft owns the
domain model, architecture, review, test design, release decisions, and production
operations. Generated changes receive no separate exemption from the evidence gates
above.

[← Back to the architecture overview](../README.md)
