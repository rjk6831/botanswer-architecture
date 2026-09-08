#!/usr/bin/env node
// Renders metrics/latest.json into the README block between
// <!-- metrics:start --> and <!-- metrics:end -->, and writes shields.io
// endpoint badges to metrics/badges/. No dependencies.
//
//   node metrics/render.mjs            # from the architecture repo root

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const m = JSON.parse(readFileSync("metrics/latest.json", "utf8"));
const n = (x) => x.toLocaleString("en-US");
const L = m.lines, F = m.files, T = m.tests;

const migrationKind = m.product === "botanswer" ? "forward-only D1 SQL" : "Alembic revisions";
const testKind = m.product === "botanswer"
  ? `Vitest, ${n(T.js_parameterized_tables)} parameterized tables expand at run time`
  : `${n(T.python_cases)} pytest (${n(T.python_parametrize_decorators)} parametrized) and ${n(T.js_cases)} Node test-runner cases`;

const cells = [
  ["Application source", `**${n(L.application)}** lines`],
  ["Automated tests", `**${n(L.tests)}** lines in ${n(F.test_files)} files`],
  ["Test cases", `**${n(T.declared_cases)}** declared`],
  ["Migrations", `**${n(F.migrations)}** ${migrationKind}`],
];
if (m.i18n && m.i18n.catalogs) cells.push(["Locales", `**${m.i18n.catalogs}** catalogs, ${n(m.i18n.keys_max)} keys`]);

const block = [
  "<!-- metrics:start -->",
  `| ${cells.map((c) => c[0]).join(" | ")} |`,
  `|${cells.map(() => "---:").join("|")}|`,
  `| ${cells.map((c) => c[1]).join(" | ")} |`,
  "",
  `<sub>Measured from the private product repository at commit \`${m.commit}\` (${m.commit_date}); refreshed ${m.measured_at}. ` +
    `${n(L.code_total)} lines of code in total across application, tests, migrations, and infrastructure; ${n(m.commits_total)} commits since ${m.first_commit}, ${n(m.commits_last_30_days)} in the last 30 days. ` +
    `Test cases: ${testKind}. Counting rules and the workflow that keeps this current: <a href="metrics/README.md">metrics/README.md</a>.</sub>`,
  "<!-- metrics:end -->",
].join("\n");

const readme = readFileSync("README.md", "utf8");
const re = /<!-- metrics:start -->[\s\S]*?<!-- metrics:end -->/;
if (!re.test(readme)) throw new Error("README.md has no metrics block markers");
writeFileSync("README.md", readme.replace(re, block));

mkdirSync("metrics/badges", { recursive: true });
const badge = (file, label, message, color = "1f3864") =>
  writeFileSync(`metrics/badges/${file}.json`, JSON.stringify({ schemaVersion: 1, label, message, color }) + "\n");
badge("tests", "test cases", n(T.declared_cases));
badge("code", "lines of code", n(L.code_total));
badge("migrations", "migrations", n(F.migrations));
badge("measured", "measured", `${m.measured_at} @ ${m.commit}`, "555555");
console.log(`README metrics block and badges rendered from ${m.product} @ ${m.commit}`);
