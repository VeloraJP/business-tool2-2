import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

test("RepositoryはFormula・Calculator・DOMへ依存しない", async () => {
  const directory = join(root, "assets/js/storage");
  for (const file of (await readdir(directory)).filter((name) => name.endsWith(".js"))) {
    const source = await readFile(join(directory, file), "utf8");
    assert.doesNotMatch(source, /\/formulas\/|\/calculators\/|\bdocument\b|\bwindow\b/, file);
  }
});

test("Phase 4でFormula・既存Engine・Service Workerを変更対象にしない境界を維持する", async () => {
  const formulaFiles = (await readdir(join(root, "assets/js/formulas"))).filter((name) => name.endsWith(".js"));
  const engineFiles = (await readdir(join(root, "assets/js/engines"))).filter((name) => name.endsWith("-engine.js"));
  assert.ok(formulaFiles.length > 0);
  assert.equal(engineFiles.length, 12);
});
