#!/usr/bin/env node
/**
 * Spoiler payload check (orrery#106): curator `note` fields must never reach
 * the client, not in the served HTML and not in the RSC flight data.
 *
 * The rendered prose was always clean; the leak was in the props handed to
 * client components, which Next.js serializes into the page. So this reads
 * what the production build actually prerendered (.html, .rsc and the
 * per-segment .rsc files), not a component in isolation.
 *
 * The page under test is a made-up wing (scripts/fixtures/spoiler-wing) whose
 * every `note` names a fake spoiler. Wing routes only exist for wings present
 * at build time, so the fixture is copied into the content folder first:
 *
 *   node scripts/spoiler-check.mjs --install   # before `npm run build`
 *   npm run build
 *   node scripts/spoiler-check.mjs             # fails if a note shipped
 *   node scripts/spoiler-check.mjs --remove    # local runs: tidy up
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SLUG = "spoiler-fixture";
const FIXTURE = path.join(ROOT, "scripts", "fixtures", "spoiler-wing");
const TARGET = path.join(ROOT, "orrery-content", "content", "franchises", SLUG);
const BUILT = path.join(ROOT, ".next", "server", "app");

// Present in the page: proves the fixture was actually built.
const VISIBLE = "FIXTURE-SYNOPSIS-VISIBLE";
// Never in the page: every curator note in the fixture.
const SECRETS = ["FIXTURE-WORK-NOTE", "FIXTURE-EVENT-NOTE", "FIXTURE-ERA-NOTE", "FIXTURE-EDITION-NOTE"];

if (process.argv.includes("--install")) {
  fs.cpSync(FIXTURE, TARGET, { recursive: true });
  console.log(`installed ${path.relative(ROOT, TARGET)}`);
  process.exit(0);
}
if (process.argv.includes("--remove")) {
  fs.rmSync(TARGET, { recursive: true, force: true });
  console.log(`removed ${path.relative(ROOT, TARGET)}`);
  process.exit(0);
}

const files = (p) =>
  !fs.existsSync(p) ? [] : fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap((f) => files(path.join(p, f))) : [p];

let failed = false;
for (const locale of ["en", "pt"]) {
  const base = path.join(BUILT, locale, "f", SLUG);
  const outputs = {
    html: files(`${base}.html`),
    rsc: [...files(`${base}.rsc`), ...files(`${base}.segments`)],
  };
  for (const [kind, list] of Object.entries(outputs)) {
    const body = list.map((f) => fs.readFileSync(f, "utf8")).join("\n");
    const route = `/${locale}/f/${SLUG} ${kind} (${list.length} file${list.length === 1 ? "" : "s"})`;
    if (!body.includes(VISIBLE)) {
      failed = true;
      console.log(`FAIL ${route}: fixture not built; run with --install before npm run build`);
      continue;
    }
    const leaks = SECRETS.filter((s) => body.includes(s));
    if (leaks.length) failed = true;
    console.log(`${leaks.length ? "FAIL" : "ok  "} ${route}: ${leaks.length ? "leaks " + leaks.join(", ") : "no note text"}`);
  }
}
process.exit(failed ? 1 : 0);
