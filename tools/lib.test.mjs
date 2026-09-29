// Run with: node --test tools/lib.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ROOT, key, clip, deabstract, pageCount } from "./lib.mjs";

test("key() matches keyOf() in index.html, so ratings and fixes line up", () => {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const src = html.match(/function keyOf\(t\)\{[^\n]*\}/);
  assert.ok(src, "keyOf() not found in index.html");
  const keyOf = new Function(src[0] + "; return keyOf;")();
  for(const t of ["The Echo Chamber Effect on Social Media", "Ångström & Æthelred: 1066–1087!",
    "“Hella Nor Cal or Totally So Cal?”", "日本語のタイトル", "x".repeat(120)])
    assert.equal(key(t), keyOf(t), t);
});

test("key() drops punctuation and case and caps the length", () => {
  assert.equal(key("Control at stability's edge"), "controlatstabilitysedge");
  assert.equal(key("a".repeat(100)).length, 80);
});

test("clip() cuts at a word boundary", () => {
  assert.equal(clip("  one   two  ", 20), "one two");
  assert.equal(clip("one two three", 9), "one two…");
});

test("deabstract() rebuilds an OpenAlex inverted index", () => {
  assert.equal(deabstract({ world: [1], hello: [0, 2] }), "hello world hello");
  assert.equal(deabstract(null), "");
});

test("pageCount() keeps plausible page ranges only", () => {
  assert.equal(pageCount({ first_page: "10", last_page: "21" }), 12);
  assert.equal(pageCount({ first_page: "e1003", last_page: "e1003" }), 0);
  assert.equal(pageCount({ first_page: "5", last_page: "5" }), 0);
  assert.equal(pageCount({ first_page: "1", last_page: "400" }), 0);
  assert.equal(pageCount(null), 0);
});
