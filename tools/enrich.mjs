// Final build step: upgrades the paper half of the deck in place and writes
// corpus.js to the repo root (no more copying it up by hand).
//
//   node tools/enrich.mjs            # reads tools/corpus.js if build5.py just made one, else ./corpus.js
//   node tools/enrich.mjs fixes.json # also folds corrections exported from the app into the ratings files
//
// Sprint topics get k (talkability 0-3) and a corrected domain from tools/topic_ratings.tsv.
// What it does to each paper:
//   - looks it up on OpenAlex (cached in tools/openalex_cache.json) for a page
//     count and a direct PDF link, keeping the DOI page as the fallback link
//   - applies the hand-reviewed labels in tools/paper_ratings.tsv:
//       a  approachability for two non-specialists, 0-3  (drives "Date night")
//       d  domain, fixing OpenAlex's topic misfiles
//       e  1 if it reports its own data, so data-only lenses aren't dealt for theory papers
//   - trims clipped abstracts back to the last whole sentence
// Papers missing from the ratings file keep their OpenAlex domain and get a=1, e=1.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(TOOLS);
// Contact for the APIs' polite pools. Optional: set CONTACT_EMAIL to add yours.
const MAIL = process.env.CONTACT_EMAIL || "";
const MAILTO = MAIL ? "&mailto=" + encodeURIComponent(MAIL) : "";
// Optional free key from openalex.org: 10x the keyless daily budget.
const KEY = process.env.OPENALEX_API_KEY ? "&api_key=" + process.env.OPENALEX_API_KEY : "";
const CACHE = path.join(TOOLS, "openalex_cache.json");
const RATINGS = path.join(TOOLS, "paper_ratings.tsv");

const DOMS = { L:"Life & evolution", M:"Mind & behaviour", P:"Physics & space", E:"Earth & climate",
  C:"Chemistry & materials", X:"Maths & computing", B:"Medicine & the body",
  G:"Engineering & built things", H:"History & archaeology", S:"Society, law & money",
  K:"Language & culture", A:"Art & design" };
const CODE = Object.fromEntries(Object.entries(DOMS).map(([c, d]) => [d, c]));
const TOPIC_RATINGS = path.join(TOOLS, "topic_ratings.tsv");

export const key = t => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 80);

function loadCorpus(){
  const fresh = path.join(TOOLS, "corpus.js"), live = path.join(ROOT, "corpus.js");
  const src = fs.existsSync(fresh) && fs.statSync(fresh).mtimeMs > fs.statSync(live).mtimeMs ? fresh : live;
  const txt = fs.readFileSync(src, "utf8");
  console.log("reading", path.relative(ROOT, src));
  return JSON.parse(txt.slice(txt.indexOf("=") + 1).replace(/;\s*$/, ""));
}

function trimToSentence(s, min){
  if(!/…$/.test(s)) return s;
  const body = s.slice(0, -1);
  const m = body.match(/^[\s\S]*[.!?](?=\s)/);
  return m && m[0].length >= min ? m[0] : s;
}

function pages(b){
  const f = parseInt(b && b.first_page, 10), l = parseInt(b && b.last_page, 10);
  if(!(f > 0 && l >= f)) return 0;
  const n = l - f + 1;
  return n >= 2 && n <= 120 ? n : 0;
}

// Keyless OpenAlex has a small daily credit budget and title searches burn it,
// so papers are looked up by DOI, 50 per request. The DOI comes out of the link
// the deck already has; PubMed Central links go through NCBI's free converter.
function idOf(u){
  let m;
  if((m = u.match(/(10\.\d{4,9}\/[^\s?#&]+)/)))
    return { doi: decodeURIComponent(m[1]).replace(/\/(full|abstract|pdf|epdf)$/, "").replace(/\.(pdf|bib)$/, "") };
  if((m = u.match(/elifesciences\.org\/articles\/(\d+)/))) return { doi: "10.7554/eLife." + m[1] };
  if((m = u.match(/nature\.com\/articles\/([^\s?#.\/]+)/))) return { doi: "10.1038/" + m[1] };
  if((m = u.match(/arxiv\.org\/(?:abs|pdf)\/([^\s?#v]+)/))) return { doi: "10.48550/arxiv." + m[1] };
  if((m = u.match(/pmc\/articles\/(?:PMC)?(\d+)/i))) return { pmc: "PMC" + m[1] };
  return null;
}
const sleep = ms => new Promise(s => setTimeout(s, ms));
async function getJSON(url){
  for(let a = 0; a < 3; a++){
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) }).catch(() => null);
    if(r && r.ok) return r.json();
    if(r && r.status === 429 && a === 2) throw new Error("OpenAlex daily budget used up - rerun tomorrow, the cache keeps what's done");
    await sleep(1500 * (a + 1));
  }
  return null;
}
const chunks = (xs, n) => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));

const corpus = loadCorpus();
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
const todo = corpus.papers.filter(p => !(key(p.t) in cache))
  .map(p => ({ p, id: idOf(p.u) })).filter(x => x.id);
console.log(`OpenAlex: ${Object.keys(cache).length} cached, ${todo.length} to fetch`);

for(const batch of chunks(todo.filter(x => x.id.pmc), 150)){
  const j = await getJSON("https://pmc.ncbi.nlm.nih.gov/tools/idconv/api/v1/articles/?format=json&tool=coldopen"
    + (MAIL ? "&email=" + encodeURIComponent(MAIL) : "") + "&ids=" + batch.map(x => x.id.pmc).join(","));
  const doi = {};
  for(const r of (j && j.records) || []) if(r.doi) doi[r.pmcid] = r.doi;
  for(const x of batch) x.id = doi[x.id.pmc] ? { doi: doi[x.id.pmc] } : null;
}
for(const batch of chunks(todo.filter(x => x.id && x.id.doi), 50)){
  const j = await getJSON("https://api.openalex.org/works?per-page=50&select=doi,biblio,best_oa_location"
    + MAILTO + KEY + "&filter=doi:" + batch.map(x => encodeURIComponent(x.id.doi)).join("|"));
  if(!j) continue;
  const byDoi = {};
  for(const w of j.results || []) byDoi[(w.doi || "").replace("https://doi.org/", "").toLowerCase()] = w;
  for(const x of batch){
    const w = byDoi[x.id.doi.toLowerCase()];
    cache[key(x.p.t)] = w
      ? { doi: w.doi || "", pdf: (w.best_oa_location || {}).pdf_url || "", pg: pages(w.biblio) }
      : { doi: "https://doi.org/" + x.id.doi };
  }
  fs.writeFileSync(CACHE, JSON.stringify(cache));
}

/* ---------- ratings, plus corrections exported from the app ---------- */
// A ratings file is: header comments, then key<TAB>score<TAB>domain code[<TAB>e].
function readTSV(file){
  const head = [], rows = new Map();
  if(fs.existsSync(file)) for(const line of fs.readFileSync(file, "utf8").split(/\r?\n/)){
    if(!line) continue;
    if(line.startsWith("#")) head.push(line);
    else { const c = line.split("\t"); rows.set(c[0], c.slice(1)); }
  }
  return { head, rows };
}
function writeTSV(file, { head, rows }){
  fs.writeFileSync(file, head.concat([...rows].map(([k, v]) => [k, ...v].join("\t"))).join("\n") + "\n");
}
const papersTSV = readTSV(RATINGS), topicsTSV = readTSV(TOPIC_RATINGS);
if(!topicsTSV.head.length) topicsTSV.head.push("# key\tk(0-3 talkability: is there five minutes of talk in it?)\tdomain code",
  "# domains: " + Object.entries(DOMS).map(([c, d]) => c + " " + d).join(" | "));

// Any .json given on the command line is an app export ("Export fixes", or the log export).
let fixed = 0;
for(const f of process.argv.slice(2).filter(a => a.endsWith(".json"))){
  const o = JSON.parse(fs.readFileSync(f, "utf8")), fx = o.fixes || {};
  for(const [k, v] of Object.entries(fx.papers || {})){
    const old = papersTSV.rows.get(k) || ["1", "", "1"];
    papersTSV.rows.set(k, [v.a ?? old[0], CODE[v.d] || old[1], v.e ?? old[2]].map(String)); fixed++;
  }
  for(const [k, v] of Object.entries(fx.topics || {})){
    const old = topicsTSV.rows.get(k) || ["1", ""];
    topicsTSV.rows.set(k, [v.k ?? old[0], CODE[v.d] || old[1]].map(String)); fixed++;
  }
}
if(fixed){
  writeTSV(RATINGS, papersTSV); writeTSV(TOPIC_RATINGS, topicsTSV);
  console.log(`folded ${fixed} corrections into the ratings files`);
}

// A score of "x" means "doesn't belong in the deck" (not English, not a research
// article, a stub): drop it here rather than deleting it upstream.
const dropped = (tsv, x) => (tsv.rows.get(key(x.t)) || [])[0] === "x";
const before = corpus.papers.length + corpus.topics.length;
corpus.papers = corpus.papers.filter(p => !dropped(papersTSV, p));
corpus.topics = corpus.topics.filter(t => !dropped(topicsTSV, t));
const ndrop = before - corpus.papers.length - corpus.topics.length;
if(ndrop) console.log(`dropped ${ndrop} cards rated x`);

let rated = 0, pdfs = 0, pgs = 0, trated = 0;
for(const t of corpus.topics){
  const r = topicsTSV.rows.get(key(t.t));
  if(r){ trated++; t.k = +r[0]; if(DOMS[r[1]]) t.d = DOMS[r[1]]; } else t.k = 1;
}
for(const p of corpus.papers){
  const r = papersTSV.rows.get(key(p.t)), oa = cache[key(p.t)] || {};
  if(r){ rated++; p.a = +r[0]; if(DOMS[r[1]]) p.d = DOMS[r[1]]; p.e = +r[2]; } else { p.a = 1; p.e = 1; }
  const isFile = /\.pdf$|\/pdf(\/|$)|\.bib$/i.test(p.u);
  if(!oa.pdf && /\.pdf$|\/pdf(\/|$)/i.test(p.u)) oa.pdf = p.u;
  if(oa.pdf){ p.pdf = oa.pdf; pdfs++; }
  if(oa.doi && isFile) p.u = oa.doi;          // the card's main link is the article page
  if(oa.pg){ p.pg = oa.pg; pgs++; }
  p.x = trimToSentence(p.x, 300);
}
for(const t of corpus.topics) t.x = trimToSentence(t.x, 160);
// Angles and lenses now live in prompts.js, so they can be edited without a rebuild.
delete corpus.shapes; delete corpus.lenses;
corpus.domains = [...new Set([...corpus.domains, ...corpus.papers.map(p => p.d)])].filter(d => d !== "Wildcard");

fs.writeFileSync(path.join(ROOT, "corpus.js"), "window.SEEDS=" + JSON.stringify(corpus) + ";");
const byA = [0, 1, 2, 3].map(a => corpus.papers.filter(p => p.a === a).length);
const byK = [0, 1, 2, 3].map(k => corpus.topics.filter(t => t.k === k).length);
console.log(`papers ${corpus.papers.length}: rated ${rated}, pdf ${pdfs}, pages ${pgs}; a=0..3 ${byA.join("/")}`);
console.log(`topics ${corpus.topics.length}: rated ${trated}; k=0..3 ${byK.join("/")}`);
console.log("wrote corpus.js", (fs.statSync(path.join(ROOT, "corpus.js")).size / 1e6).toFixed(2), "MB");
