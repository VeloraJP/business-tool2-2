import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

async function javascriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return javascriptFiles(path);
    return entry.isFile() && entry.name.endsWith(".js") ? [path] : [];
  }));
  return nested.flat();
}

function moduleSpecifiers(source) {
  const specifiers = [];
  const patterns = [
    /\b(?:import|export)\s+(?:[^;]*?\s+from\s+)?["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.push(match[1]);
  }
  return specifiers;
}

function executableSource(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
    .replace(/`(?:\\.|[^`])*`/gs, "``")
    .replace(/"(?:\\.|[^"\\])*"/g, "\"\"")
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}

function forbiddenRuntimeReferences(source, patterns) {
  const executable = executableSource(source);
  return patterns.filter(({ pattern }) => pattern.test(executable)).map(({ label }) => label);
}

async function layerSources(layer) {
  const directory = join(root, "assets", "js", layer);
  const files = await javascriptFiles(directory);
  return Promise.all(files.map(async (file) => ({
    file: relative(root, file).replaceAll("\\", "/"),
    source: await readFile(file, "utf8")
  })));
}

function importViolations(sources, forbiddenSegment) {
  return sources.flatMap(({ file, source }) =>
    moduleSpecifiers(source)
      .filter((specifier) => specifier.replaceAll("\\", "/").includes(forbiddenSegment))
      .map((specifier) => `${file} -> ${specifier}`)
  );
}

test("AR-T01 EngineからFormulaを直接参照しない", async () => {
  const sources = await layerSources("engines");
  assert.ok(sources.length > 0, "Engineの検査対象が空です。");
  assert.deepEqual(importViolations(sources, "/formulas/"), []);
});

test("AR-T02 CalculatorからEngineを参照しない", async () => {
  const sources = await layerSources("calculators");
  assert.ok(sources.length > 0, "Calculatorの検査対象が空です。");
  assert.deepEqual(importViolations(sources, "/engines/"), []);
});

test("AR-T03 FormulaからCalculatorを参照しない", async () => {
  const sources = await layerSources("formulas");
  assert.ok(sources.length > 0, "Formulaの検査対象が空です。");
  assert.deepEqual(importViolations(sources, "/calculators/"), []);
});

test("AR-T04 FormulaおよびCalculatorからDOMへアクセスしない", async () => {
  const sources = [...await layerSources("formulas"), ...await layerSources("calculators")];
  const patterns = [
    { label: "document", pattern: /\bdocument\b/ },
    { label: "DOM selector", pattern: /\b(?:querySelector|querySelectorAll|getElementById|getElementsByClassName|getElementsByTagName|createElement)\s*\(/ },
    { label: "DOM type", pattern: /\b(?:HTMLElement|Element|NodeList|HTMLCollection)\b/ }
  ];
  const violations = sources.flatMap(({ file, source }) =>
    forbiddenRuntimeReferences(source, patterns).map((reference) => `${file} -> ${reference}`)
  );
  assert.deepEqual(violations, []);
});

test("AR-T05 FormulaおよびCalculatorからlocalStorageへアクセスしない", async () => {
  const sources = [...await layerSources("formulas"), ...await layerSources("calculators")];
  const violations = sources.flatMap(({ file, source }) =>
    forbiddenRuntimeReferences(source, [{ label: "localStorage", pattern: /\blocalStorage\b/ }])
      .map((reference) => `${file} -> ${reference}`)
  );
  assert.deepEqual(violations, []);
});

test("AR-T06 EngineからRouterへ依存しない", async () => {
  const sources = await layerSources("engines");
  const importFailures = sources.flatMap(({ file, source }) =>
    moduleSpecifiers(source)
      .filter((specifier) => /(?:^|[/\\])router(?:[/\\.]|$)/i.test(specifier))
      .map((specifier) => `${file} -> ${specifier}`)
  );
  const runtimeFailures = sources.flatMap(({ file, source }) =>
    forbiddenRuntimeReferences(source, [{ label: "Router", pattern: /\bRouter\b/ }])
      .map((reference) => `${file} -> ${reference}`)
  );
  assert.deepEqual([...importFailures, ...runtimeFailures], []);
});

test("AR-T07・T08 検出器は空走査せず違反参照を識別する", async () => {
  assert.ok((await layerSources("engines")).length > 0);
  assert.deepEqual(moduleSpecifiers('import x from "../formulas/x.js";'), ["../formulas/x.js"]);
  assert.deepEqual(moduleSpecifiers('const x = import("../engines/x.js");'), ["../engines/x.js"]);
  assert.deepEqual(
    forbiddenRuntimeReferences("document.querySelector('#x');", [{ label: "document", pattern: /\bdocument\b/ }]),
    ["document"]
  );
  assert.deepEqual(
    forbiddenRuntimeReferences("// document is prohibited", [{ label: "document", pattern: /\bdocument\b/ }]),
    []
  );
});
