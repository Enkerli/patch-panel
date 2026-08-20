#!/usr/bin/env node
/**
 * Patch Panel validator.
 *
 * The point of this repository is that nothing is asserted without provenance,
 * so the rules below are enforced rather than merely documented. Run with:
 *
 *   node tools/validate.mjs
 *
 * Exits non-zero on any error. Warnings are printed but do not fail the build —
 * an entry resting on recollection is a known state of this project, not a bug.
 * It is what we want contributors to find and fix.
 *
 * No dependencies: this deliberately runs on a bare Node install so that a
 * first-time contributor can check their own PR without an npm install.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const data = read("data/systems.json");
const vocab = read("data/vocabulary.json");
const schema = read("data/schema.json");

const errors = [];
const warnings = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const warn = (id, msg) => warnings.push(`${id}: ${msg}`);

/* ---------------------------------------------------------------
   1. The vocabulary and the schema must agree.
   Two files can drift apart silently; this is the only check that
   catches a term documented in one place and rejected in the other.
--------------------------------------------------------------- */
const schemaEnums = {
  topology: schema.$defs.system.properties.topology.enum,
  domains: schema.$defs.system.properties.domains.items.enum,
  platforms: schema.$defs.system.properties.platforms.items.enum,
  nicety_themes: schema.$defs.system.properties.niceties.items.properties.theme.enum,
  evidence: schema.$defs.evidence.enum,
  facet_states: schema.$defs.state.enum
};
for (const [key, values] of Object.entries(schemaEnums)) {
  const documented = Object.keys(vocab[key] ?? {});
  const missing = values.filter((v) => !documented.includes(v));
  const extra = documented.filter((v) => !values.includes(v));
  if (missing.length) err("vocabulary", `${key} allowed by schema but undefined in vocabulary.json: ${missing.join(", ")}`);
  if (extra.length) err("vocabulary", `${key} defined in vocabulary.json but rejected by schema: ${extra.join(", ")}`);
}
const facetKeys = Object.keys(schema.$defs.system.properties.facets.properties);
const facetsDocumented = Object.keys(vocab.facets ?? {});
for (const f of facetKeys) {
  if (!facetsDocumented.includes(f)) err("vocabulary", `facet "${f}" is undefined in vocabulary.json`);
}

/* ---------------------------------------------------------------
   2. Structural checks the JSON Schema would catch, restated here
   so the error message names the specimen rather than a JSON path.
--------------------------------------------------------------- */
const seenIds = new Set();
const seenNames = new Set();
const isUrl = (s) => typeof s === "string" && /^https?:\/\/\S+$/.test(s);

for (const s of data.systems) {
  const id = s.id ?? "(no id)";

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id ?? "")) err(id, "id must be a lowercase slug");
  if (seenIds.has(s.id)) err(id, "duplicate id");
  if (seenNames.has(s.name)) err(id, `duplicate name "${s.name}"`);
  seenIds.add(s.id);
  seenNames.add(s.name);

  for (const key of ["name", "developer", "year", "summary"]) {
    if (!s[key]?.trim()) err(id, `${key} is empty`);
  }
  if (!schemaEnums.topology.includes(s.topology)) err(id, `unknown topology "${s.topology}"`);
  for (const d of s.domains ?? []) if (!schemaEnums.domains.includes(d)) err(id, `unknown domain "${d}"`);
  for (const p of s.platforms ?? []) if (!schemaEnums.platforms.includes(p)) err(id, `unknown platform "${p}"`);
  if (!s.platforms?.length) err(id, "no platforms listed");

  /* facets */
  for (const f of facetKeys) {
    const v = s.facets?.[f];
    if (!schemaEnums.facet_states.includes(v)) err(id, `facet ${f} has invalid state "${v}"`);
  }

  /* ---------------------------------------------------------------
     3. The evidence discipline. This is the rule the project exists
     to keep, so it is an error rather than a warning.
  --------------------------------------------------------------- */
  const rows = [
    ...(s.claims ?? []).map((c) => ["claim", c.label ?? "(unlabelled)", c]),
    ...(s.niceties ?? []).map((n) => ["nicety", n.theme ?? "(no theme)", n])
  ];
  for (const [kind, label, row] of rows) {
    if (!schemaEnums.evidence.includes(row.evidence)) {
      err(id, `${kind} "${label}" has invalid evidence "${row.evidence}"`);
      continue;
    }
    if (row.evidence !== "unverified" && !isUrl(row.source)) {
      err(id, `${kind} "${label}" is marked ${row.evidence} but has no source URL`);
    }
    if (row.evidence === "unverified" && row.source) {
      err(id, `${kind} "${label}" is marked unverified but carries a source — promote it to verified or reported`);
    }
    if (!row.text?.trim()) err(id, `${kind} "${label}" has no text`);
  }
  for (const n of s.niceties ?? []) {
    if (!schemaEnums.nicety_themes.includes(n.theme)) err(id, `nicety uses undocumented theme "${n.theme}"`);
  }

  /* ---------------------------------------------------------------
     4. Warnings: known-incomplete states worth surfacing but not
     worth blocking a contribution over.
  --------------------------------------------------------------- */
  if (!s.claims?.length) warn(id, "no claims at all");
  else if (s.claims.every((c) => c.evidence === "unverified")) warn(id, "every claim rests on recollection");

  const licenced = (s.claims ?? []).some((c) => /licen[cs]e/i.test(c.label));
  if (!licenced) warn(id, "no licence claim");

  if (s.facets?.open === "yes" && !(s.claims ?? []).some((c) => c.evidence !== "unverified" && /licen[cs]e/i.test(c.label))) {
    warn(id, "claims to be open source with no verified licence claim");
  }
}

/* ---------------------------------------------------------------
   5. Report.
--------------------------------------------------------------- */
const counts = { verified: 0, reported: 0, unverified: 0 };
for (const s of data.systems)
  for (const r of [...s.claims, ...s.niceties]) counts[r.evidence] = (counts[r.evidence] ?? 0) + 1;
const total = counts.verified + counts.reported + counts.unverified;

console.log(`patch-panel v${data.version} — ${data.systems.length} specimens, ${total} claims`);
console.log(
  `  evidence: ${counts.verified} verified · ${counts.reported} reported · ${counts.unverified} unverified ` +
    `(${Math.round((100 * counts.unverified) / total)}% unsourced)`
);

const byTopology = {};
for (const s of data.systems) byTopology[s.topology] = (byTopology[s.topology] ?? 0) + 1;
console.log("  topology:", Object.entries(byTopology).map(([k, v]) => `${k} ${v}`).join(" · "));

if (warnings.length) {
  console.log(`\n${warnings.length} warning${warnings.length === 1 ? "" : "s"} (not fatal — these are the open jobs):`);
  for (const w of warnings) console.log(`  ~ ${w}`);
}
if (errors.length) {
  console.error(`\n${errors.length} error${errors.length === 1 ? "" : "s"}:`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log("\nAll checks passed.");
