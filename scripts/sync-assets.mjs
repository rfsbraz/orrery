/**
 * Copy the content repo's generated art into public/ before a build.
 *
 * Sketches live in orrery-content under `assets/`, next to the YAML that
 * references them: they are ours, small, and meaningless apart from that entry,
 * so they version with it and cannot rot the way a link can. Next only serves
 * `public/`, so they are copied in here rather than linked - a symlink does not
 * survive the Docker build, and importing them would put binaries through the
 * bundler for no reason.
 *
 * public/assets is generated and gitignored: the content repo is the only place
 * these are edited.
 */
import { cp, rm, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = path.join(root, "orrery-content", "assets");
const dest = path.join(root, "public", "assets");

if (!existsSync(src)) {
  console.log("sync-assets: no orrery-content/assets, nothing to copy");
  process.exit(0);
}

// Rebuild rather than merge: a sketch deleted in content must disappear here
// too, or the site keeps serving art no entry references any more.
await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });

let files = 0;
const walk = async (dir) => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) await walk(path.join(dir, e.name));
    else files += 1;
  }
};
await walk(dest);
console.log(`sync-assets: copied ${files} asset(s) to public/assets`);
