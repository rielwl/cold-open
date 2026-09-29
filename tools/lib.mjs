// Helpers shared by enrich.mjs and extend.mjs. Importing this file has no side effects.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TOOLS = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.dirname(TOOLS);
export const LIVE_CORPUS = path.join(ROOT, "corpus.js");

// Contact for the APIs' polite pools. Optional: set CONTACT_EMAIL to add yours.
export const MAIL = process.env.CONTACT_EMAIL || "";
// Query-string tail for every OpenAlex call. OPENALEX_API_KEY is an optional
// free key from openalex.org: 10x the keyless daily budget.
export const OPENALEX_AUTH = (MAIL ? "&mailto=" + encodeURIComponent(MAIL) : "")
  + (process.env.OPENALEX_API_KEY ? "&api_key=" + encodeURIComponent(process.env.OPENALEX_API_KEY) : "");

export const DOMAINS = { L:"Life & evolution", M:"Mind & behaviour", P:"Physics & space", E:"Earth & climate",
  C:"Chemistry & materials", X:"Maths & computing", B:"Medicine & the body",
  G:"Engineering & built things", H:"History & archaeology", S:"Society, law & money",
  K:"Language & culture", A:"Art & design" };

// The ratings files and the app's saved fixes are keyed by this. It must stay
// identical to keyOf() in index.html; lib.test.mjs checks that.
export const key = t => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 80);

export function readCorpus(file = LIVE_CORPUS){
  const txt = fs.readFileSync(file, "utf8");
  return JSON.parse(txt.slice(txt.indexOf("=") + 1).replace(/;\s*$/, ""));
}
export function writeCorpus(corpus){
  fs.writeFileSync(LIVE_CORPUS, "window.SEEDS=" + JSON.stringify(corpus) + ";");
}

const sleep = ms => new Promise(s => setTimeout(s, ms));
// GET with three tries and a 30s timeout. Returns null if every try fails,
// and throws if the API is still rate-limiting on the last try.
export async function getJSON(url, headers){
  for(let a = 0; a < 3; a++){
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(30000) }).catch(() => null);
    if(r && r.ok) return r.json();
    if(r && r.status === 429 && a === 2)
      throw new Error("rate limited by " + new URL(url).host
        + " (for OpenAlex, the daily budget is used up: rerun tomorrow, the cache keeps what's done)");
    await sleep(1500 * (a + 1));
  }
  return null;
}

// Collapses whitespace and cuts at a word boundary, marking the cut with an ellipsis.
export const clip = (s, n) => {
  s = (s || "").replace(/\s+/g, " ").trim();
  return s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, "") + "…";
};

// OpenAlex ships abstracts as { word: [positions] }.
export function deabstract(inv){
  if(!inv) return "";
  const pos = [];
  for(const [w, idx] of Object.entries(inv)) for(const i of idx) pos[i] = w;
  return pos.filter(Boolean).join(" ");
}

// Page count from an OpenAlex biblio, or 0 when it's missing or implausible
// (a single page, or more than 120).
export function pageCount(biblio){
  const f = parseInt(biblio && biblio.first_page, 10), l = parseInt(biblio && biblio.last_page, 10);
  if(!(f > 0 && l >= f)) return 0;
  const n = l - f + 1;
  return n >= 2 && n <= 120 ? n : 0;
}
