# How the numbers on the front page are produced

The engineering snapshot in the README is generated from the private product repository by the two scripts in this folder, and a GitHub Actions workflow in the product repository re-runs them on every push to `main`.

## Files

| File | Role |
|---|---|
| `collect.mjs` | Counts a git checkout of the product and writes `latest.json`. Node only, no dependencies. |
| `render.mjs` | Rewrites the README block between `<!-- metrics:start -->` and `<!-- metrics:end -->` from `latest.json`, and writes shields.io endpoint badges to `badges/`. |
| `latest.json` | The current measurement: commit, date, line counts by category, file counts, test-case counts, locale catalogs, commit activity. |
| `product-repo-workflow.yml` | The workflow that runs in the private product repository. It checks out both repositories, runs `collect.mjs` against the product, runs `render.mjs` here, and commits the result. |
| `badges/*.json` | Badge data read by `img.shields.io/endpoint`. |

## Counting rules

`collect.mjs` walks `git ls-files` and classifies every tracked file by path and extension. Physical lines are counted, blank lines included, so the same file always counts the same way regardless of formatting style.

| Category | What lands here |
|---|---|
| Application source | Code that ships: `src/`, `dashboard/web/src/`, `api/app/`, `web/src/`, marketing-site source, small JSON config. Test files are excluded even when they sit beside source. |
| Automated tests | Anything under `tests/`, `__tests__/`, `e2e/`, `__snapshots__/`, `benchmarks/`, plus `*.test.*`, `*.spec.*`, `test_*.py`, and `conftest.py`. Fixtures and snapshots are part of the suite and count here. |
| Migrations | `migrations/` (D1 SQL) or `alembic/versions/` (Python revisions). The file count is the number of migrations. |
| Infrastructure | `scripts/`, `deploy/`, `.github/`, Dockerfiles, Compose files, Wrangler config, build and tooling config, package manifests, shell scripts. |
| Documentation | Markdown and text, and agent prompt folders. Reported, and kept out of the code total. |

Excluded from every category: dependencies, lockfiles, build output, binaries (images, video, fonts, archives), database backups, XML and CSV data, JSON files over 2,000 lines (recorded evidence and demo datasets), and design-canvas exports.

The **code total** is application + tests + migrations + infrastructure. Documentation is never added to it.

**Test cases** are counted from source: `it(` and `test(` calls in Vitest and Node test-runner files, `def test_` functions in pytest files. Parameterized tables (`it.each`, `test.each`, `@pytest.mark.parametrize`) count once here and expand when the runner executes, so a runner reports a larger number than this page does. The number here is the floor.

**Locale catalogs** are counted with the same key pattern the product's own i18n audit uses, so the README figure matches what the release gate checks.

## Why a script

A typed number goes stale the day after it is typed. The workflow writes these from the commit it names, and anyone can re-run the measurement: check out the private repository, run `node metrics/collect.mjs --repo . --product <name>`, and compare. The same rule applies to the screenshots and videos on the product sites, where the screenshots are captured from the running application by Playwright at build time in every supported language and the videos are recordings of the same surfaces. If the product does not have a screen, the site has an empty frame; if the repository does not have the tests, this page does not have the number.

## Reproducing a measurement by hand

```
git clone git@github.com:rjk6831/<architecture-repo>.git arch
cd <private-product-checkout>
node ../arch/metrics/collect.mjs --repo . --product <name> [--i18n <catalog dir>]
```

The output is the same JSON that lands in `latest.json`.
