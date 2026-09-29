// Checks on what the page ships: index.html, prompts.js and the generated corpus.js.
// Run with: node --test tools/*.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { ROOT, key } from "./lib.mjs";

const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const html = read("index.html");
// Runs a window.X = ... data file and returns window.X.
const loadGlobal = (file, name) => { const window = {}; vm.runInNewContext(read(file), { window }); return window[name]; };

test("the inline app script parses", () => {
  const start = html.lastIndexOf("<script>") + "<script>".length;
  const src = html.slice(start, html.indexOf("</script>", start));
  assert.ok(src.length > 1000, "inline script not found");
  assert.doesNotThrow(() => new vm.Script(src));
});

test("every file the page loads is deployed", () => {
  const workflow = read(".github/workflows/pages.yml");
  const copyLine = workflow.split("\n").find(l => /^\s*cp .* _site\/?\s*$/.test(l));
  assert.ok(copyLine, "cp ... _site/ step not found in pages.yml");
  for(const [, src] of html.matchAll(/<script src="([^"]+)"/g))
    assert.ok(copyLine.split(/\s+/).includes(src), `${src} is loaded by index.html but not copied in pages.yml`);
});

test("prompts.js has five question groups, lenses and talk questions", () => {
  const P = loadGlobal("prompts.js", "PROMPTS");
  assert.equal(P.questions.length, 5);
  for(const g of P.questions) assert.ok(g.g && g.q.length, "empty question group " + g.g);
  for(const l of P.lenses) assert.ok(l.n && l.s && l.p, "lens missing n, s or p: " + JSON.stringify(l));
  assert.ok(P.lenses.some(l => l.needs !== "data"), "theory papers need at least one lens without needs:\"data\"");
  assert.ok(P.talk.length);
});

test("corpus.js cards have the fields and values the app reads", () => {
  const S = loadGlobal("corpus.js", "SEEDS");
  const domains = new Set([...S.domains, "Wildcard"]);
  const checkKind = (cards, fields, scoreField) => {
    const keys = new Set();
    for(const c of cards){
      for(const f of fields) assert.ok(c[f] != null && c[f] !== "", `${c.t}: missing ${f}`);
      assert.ok(domains.has(c.d), `${c.t}: unknown domain ${c.d}`);
      assert.ok([0, 1, 2, 3].includes(c[scoreField]), `${c.t}: ${scoreField}=${c[scoreField]}`);
      assert.match(c.u, /^https?:\/\//, c.t);
      if(c.pdf) assert.match(c.pdf, /^https?:\/\//, c.t);
      // Ratings and fixes are keyed by key(title), so two cards must never share one.
      assert.ok(!keys.has(key(c.t)), `${c.t}: duplicate key`);
      keys.add(key(c.t));
    }
  };
  checkKind(S.topics, ["t", "x", "u", "d"], "k");
  checkKind(S.papers, ["t", "x", "u", "j", "y", "d"], "a");
  for(const p of S.papers) assert.ok(p.e === 0 || p.e === 1, `${p.t}: e=${p.e}`);
});
