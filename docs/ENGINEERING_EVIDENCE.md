# Engineering evidence

This document defines the quantitative claims in the public architecture overview
and keeps codebase inventory separate from verification and production state.

> **Snapshot date:** 24 August 2026
>
> **Application source:** private
>
> **Public scope:** measurement method, engineering controls, and explicit non-claims

## Dated snapshot

| Measure | Snapshot | What it means |
|---|---:|---|
| Captured WIP test inventory | **2,684 cases across 280 test files** | Work-in-progress snapshot, rounded to “approximately 2,700” in the overview. It is not presented as a fresh full-suite pass. |
| Last complete green test checkpoint | **2,576 passing cases across 274 test files** | Separate Worker/runtime and dashboard lanes at commit `90cd31e63432`. |
| Captured WIP authored TypeScript, TSX, and SQL | **203,782 lines across 770 files** | Raw BotMetrics subtotal minus one 4,606-line generated database backup. |
| Clean committed engineering baseline | **198,917 lines** | Tracked TypeScript, TSX, and SQL at commit `e09c5e2088f3` after excluding the generated SQL backup. |
| Captured adjusted source, config, and docs | **267,873 lines across 1,022 files** | Broader working-tree estimate after the generated backup and common lockfiles are excluded; includes documentation and configuration. |
| Captured WIP migration inventory | **73 sequentially numbered files** | 70 were committed at the captured application HEAD (`e09c5e2088f3`) and 3 were additional WIP files; this does not imply remote application. |
| Production D1 checkpoint | **0068 applied** | Last remote read-only confirmation in the snapshot evidence. |
| Localization checkpoint | **2,099 keys in each of 5 catalogs** | Last recorded complete catalog audit, not a live recount of later local work. |

## Line-count method

The supplied BotMetrics run examined Git-visible working-tree files and skipped binary
files from line and character counts. The public headline uses the narrow subtotal
below, not the broadest available number:

| Extension | Files | Lines |
|---|---:|---:|
| `.ts` | 620 | 160,862 |
| `.tsx` | 77 | 33,407 |
| `.sql` | 74 | 14,119 |
| **Raw engineering-language subtotal** | **771** | **208,388** |
| Generated database backup | −1 | −4,606 |
| **Authored engineering-language subtotal** | **770** | **203,782** |

That snapshot included then-current local work. For a stable clean-commit comparison,
the same three tracked language families contained 203,523 physical lines at commit
`e09c5e2088f3`; excluding a 4,606-line generated database backup produces a defensible
committed baseline of **198,917 lines**.

The raw BotMetrics nonbinary-text estimate was 272,479 lines across 1,023 files after
common lockfiles were excluded. Removing the same generated database backup produces
an adjusted **267,873 lines across 1,022 files** covering source, configuration, and
documentation. It is disclosed as a broader maintenance-surface estimate, but it is
not substituted for the narrower source-language total.

Dependencies, binary media, and build artifacts are not presented as authored source.
Lines of code measure maintenance surface—not quality, productivity, or business value.

## Test-count method and checkpoint

The captured working-tree snapshot contained **2,684 cases across 280 Git-visible test files**:
2,272 Worker/runtime cases across 231 files and 412 dashboard cases across 49 files.
The overview rounds this to **approximately 2,700**, not `2,700+`.

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
- Approximately 2,700 is captured test inventory, not coverage percentage or a current
  all-green assertion.
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
