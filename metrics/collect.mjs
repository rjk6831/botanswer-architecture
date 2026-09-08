#!/usr/bin/env node
// Repository metrics collector for the Roots No Limits architecture repos.
//
// Counts what is tracked by git in a product repository and writes one JSON
// document. No dependencies. Run from anywhere:
//
//   node collect.mjs --repo /path/to/product --product botanswer --out latest.json
//   add --i18n dashboard/web/src/i18n to count keys per locale catalog
//
// What is counted (physical lines of tracked text files, blank lines included):
//   application  source that ships: src/, dashboard/web/src/, api/app/, web/src/ and
//                similar; excludes test files, fixtures, docs, data files, media
//   tests        test files, fixtures, snapshots, and test helpers
//   migrations   SQL migrations (D1) or Alembic revision files
//   infra        deploy scripts, Dockerfiles, Compose files, Wrangler config, CI
//                workflows, build and tooling config, package manifests
//   docs         Markdown and text (reported, not part of the code total)
//
// Not counted anywhere: dependencies, lockfiles, build output, binaries (images,
// video, fonts, archives), database backups, XML and CSV data, JSON data files
// larger than 2,000 lines (recorded evidence, demo datasets), design-canvas
// exports, and files git does not track. Agent prompt folders (.claude/) count
// as docs.
//
// Test cases are counted statically from source: `it(` / `test(` calls in
// Vitest and Node test-runner files, `def test_` functions in pytest files.
// Parameterized tables (`.each`, `@pytest.mark.parametrize`) are counted once
// here and expand when the runner executes, so a runner reports more.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, all) => (a.startsWith("--") ? [a.slice(2), all[i + 1]] : [])).filter((x) => x.length)
);
const repo = args.repo || process.cwd();
const product = args.product || basename(repo);
const out = args.out || null;
const i18nDir = args.i18n || null; // optional: directory of locale catalogs to count keys in

const BINARY = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".svg", ".mp4", ".mov", ".mp3", ".wav", ".woff", ".woff2", ".ttf", ".otf", ".pdf", ".zip", ".gz", ".bin", ".jpg", ".heic"]);
const LOCK = new Set(["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "poetry.lock", "uv.lock"]);
const INFRA_BASENAMES = new Set([
  "dockerfile", "docker-compose.yml", "docker-compose.yaml", "caddyfile", "package.json", "tsconfig.json", "tsconfig.test.json",
  "vitest.config.ts", "vitest.config.js", "vite.config.js", "vite.config.ts", "playwright.config.ts", "pyproject.toml", "alembic.ini",
  "pytest.ini", "requirements.txt", "build.mjs", "wrangler.toml", "wrangler.jsonc", ".env.example"
]);

function classify(file) {
  const low = file.toLowerCase();
  const base = basename(low);
  const ext = extname(low);
  if (LOCK.has(base) || ext === ".lock") return "lockfile";
  if (/(^|\/)(node_modules|dist|build|coverage|\.venv|venv|__pycache__|\.egg-info)(\/|$)/.test(low)) return "generated";
  if (base.endsWith(".tsbuildinfo") || /\.timestamp-\d+/.test(base) || base.endsWith(".bundle.js") || base.endsWith(".dc.html")) return "generated";
  if (BINARY.has(ext)) return "binary";
  if (/^backup.*\.sql$/.test(base) || ext === ".xml" || ext === ".csv") return "data";
  if (/(^|\/)\.claude(\/|$)/.test(low)) return "docs";
  if (/(^|\/)(tests?|__tests__|e2e|spec|__snapshots__|benchmarks?)(\/|$)/.test(low)) return "tests";
  if (/\.(test|spec)\.(ts|tsx|js|jsx|mjs|py)$/.test(low) || /(^|\/)test_[^/]*\.py$/.test(low) || base === "conftest.py") return "tests";
  if (/(^|\/)(migrations?|alembic\/versions)(\/|$)/.test(low)) return "migrations";
  if (/(^|\/)(scripts?|deploy|infra|ops|\.github)(\/|$)/.test(low)) return "infra";
  if (INFRA_BASENAMES.has(base) || base.startsWith("docker-compose") || base.startsWith("wrangler.") || ext === ".sh") return "infra";
  if (ext === ".md" || ext === ".txt" || ext === ".rst") return "docs";
  if (ext === ".json" || ext === ".jsonc") return "data?"; // decided by size below
  if ([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".sql", ".html", ".css", ".toml", ".yml", ".yaml"].includes(ext)) return "application";
  return "other";
}

const files = execFileSync("git", ["-C", repo, "ls-files", "-z"], { maxBuffer: 1 << 28 })
  .toString("utf8").split("\0").filter(Boolean);

const totals = {};
const add = (cat, lines) => {
  totals[cat] ??= { files: 0, lines: 0 };
  totals[cat].files += 1;
  totals[cat].lines += lines;
};

let testFiles = 0, jsCases = 0, jsEach = 0, pyCases = 0, pyParam = 0;
const migrationFiles = [];

for (const f of files) {
  let cat = classify(f);
  if (cat === "binary" || cat === "generated" || cat === "lockfile") { add(cat, 0); continue; }
  let text;
  try {
    const buf = readFileSync(join(repo, f));
    if (buf.subarray(0, 8000).includes(0)) { add("binary", 0); continue; }
    text = buf.toString("utf8");
  } catch { continue; }
  let lines = text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
  if (cat === "data?") cat = lines > 2000 ? "data" : "application";
  if (cat === "data" ) { add("data", lines); continue; }
  add(cat, lines);
  const ext = extname(f.toLowerCase());
  if (cat === "migrations" && (ext === ".sql" || ext === ".py")) migrationFiles.push(f);
  if (cat === "tests" && /\.(test|spec)\.(ts|tsx|js|jsx|mjs)$/.test(f.toLowerCase())) {
    testFiles += 1;
    jsCases += (text.match(/^\s*(?:it|test)(?:\.(?:only|skip|todo|concurrent))?\s*\(/gm) || []).length;
    jsEach += (text.match(/^\s*(?:it|test|describe)\.each\(/gm) || []).length;
  } else if (cat === "tests" && ext === ".py" && (/(^|\/)test_[^/]*\.py$/.test(f.toLowerCase()) || /_test\.py$/.test(f.toLowerCase()))) {
    testFiles += 1;
    pyCases += (text.match(/^\s*(?:async\s+)?def\s+test_\w+/gm) || []).length;
    pyParam += (text.match(/@pytest\.mark\.parametrize/g) || []).length;
  }
}

const git = (cmd) => execFileSync("git", ["-C", repo, ...cmd]).toString("utf8").trim();
const t = (c) => totals[c] || { files: 0, lines: 0 };
const codeLines = t("application").lines + t("tests").lines + t("migrations").lines + t("infra").lines;

const result = {
  product,
  measured_at: new Date().toISOString().slice(0, 10),
  commit: git(["rev-parse", "--short", "HEAD"]),
  commit_date: git(["log", "-1", "--format=%cs"]),
  first_commit: git(["log", "--reverse", "--format=%cs"]).split("\n")[0],
  commits_total: Number(git(["rev-list", "--count", "HEAD"])),
  commits_last_30_days: Number(git(["rev-list", "--count", "--since=30.days", "HEAD"])),
  lines: {
    application: t("application").lines,
    tests: t("tests").lines,
    migrations: t("migrations").lines,
    infra: t("infra").lines,
    code_total: codeLines,
    docs: t("docs").lines,
  },
  files: {
    application: t("application").files,
    tests: t("tests").files,
    test_files: testFiles,
    migrations: migrationFiles.length,
    infra: t("infra").files,
    docs: t("docs").files,
    tracked: files.length,
  },
  tests: {
    declared_cases: jsCases + pyCases,
    js_cases: jsCases,
    js_parameterized_tables: jsEach,
    python_cases: pyCases,
    python_parametrize_decorators: pyParam,
  },
  excluded: {
    data_lines: t("data").lines,
    binary_files: t("binary").files,
    lockfile_files: t("lockfile").files,
    generated_files: t("generated").files,
  },
};

if (i18nDir) {
  // Same key pattern the product's own i18n audit uses: "dotted.key": value
  const KEY = /"([a-z0-9][a-zA-Z0-9._-]*)"\s*:/g;
  const catalogs = files
    .filter((f) => f.startsWith(i18nDir.replace(/\/$/, "") + "/") && /\.(ts|js|json)$/.test(f) && !/index\.(ts|tsx|js)$/.test(f))
    .map((f) => {
      const text = readFileSync(join(repo, f), "utf8");
      const keys = new Set();
      for (const m of text.matchAll(KEY)) keys.add(m[1]);
      return { file: f, keys: keys.size };
    })
    .sort((a, b) => b.keys - a.keys);
  // A catalog is a file carrying at least half as many keys as the largest one;
  // smaller files in the folder are helpers or partial overlays.
  const max = catalogs[0]?.keys ?? 0;
  const main = catalogs.filter((c) => c.keys >= max / 2);
  result.i18n = { catalogs: main.length, keys_max: max, keys_min: main.at(-1)?.keys ?? 0, files: main };
}

const json = JSON.stringify(result, null, 2) + "\n";
if (out) writeFileSync(out, json);
process.stdout.write(json);
