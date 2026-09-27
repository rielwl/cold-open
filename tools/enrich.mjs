// Final build step: upgrades the paper half of the deck in place and writes
// corpus.js to the repo root (no more copying it up by hand).
//
//   node tools/enrich.mjs            # reads tools/corpus.js if build5.py just made one, else ./corpus.js
//
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
const MAIL = "23545713+rielwl@users.noreply.github.com";
const CACHE = path.join(TOOLS, "openalex_cache.json");
const RATINGS = path.join(TOOLS, "paper_ratings.tsv");

const DOMS = { L:"Life & evolution", M:"Mind & behaviour", P:"Physics & space", E:"Earth & climate",
  C:"Chemistry & materials", X:"Maths & computing", B:"Medicine & the body",
  G:"Engineering & built things", H:"History & archaeology", S:"Society, law & money",
  K:"Language & culture" };

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
    const r = await fetch(url).catch(() => null);
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
  const j = await getJSON("https://pmc.ncbi.nlm.nih.gov/tools/idconv/api/v1/articles/?format=json&tool=coldopen&email="
    + MAIL + "&ids=" + batch.map(x => x.id.pmc).join(","));
  const doi = {};
  for(const r of (j && j.records) || []) if(r.doi) doi[r.pmcid] = r.doi;
  for(const x of batch) x.id = doi[x.id.pmc] ? { doi: doi[x.id.pmc] } : null;
}
for(const batch of chunks(todo.filter(x => x.id && x.id.doi), 50)){
  const j = await getJSON("https://api.openalex.org/works?per-page=50&select=doi,biblio,best_oa_location&mailto="
    + MAIL + "&filter=doi:" + batch.map(x => encodeURIComponent(x.id.doi)).join("|"));
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

const ratings = {};
if(fs.existsSync(RATINGS)){
  for(const line of fs.readFileSync(RATINGS, "utf8").split(/\r?\n/)){
    const [k, a, d, e] = line.split("\t");
    if(k && !k.startsWith("#")) ratings[k] = { a: +a, d: DOMS[d], e: +e };
  }
}

let rated = 0, pdfs = 0, pgs = 0;
for(const p of corpus.papers){
  const r = ratings[key(p.t)], oa = cache[key(p.t)] || {};
  if(r){ rated++; p.a = r.a; if(r.d) p.d = r.d; p.e = r.e; } else { p.a = 1; p.e = 1; }
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
corpus.domains = [...new Set([...corpus.domains, ...corpus.papers.map(p => p.d)])];

fs.writeFileSync(path.join(ROOT, "corpus.js"), "window.SEEDS=" + JSON.stringify(corpus) + ";");
const byA = [0, 1, 2, 3].map(a => corpus.papers.filter(p => p.a === a).length);
console.log(`papers ${corpus.papers.length}: rated ${rated}, pdf ${pdfs}, pages ${pgs}; a=0..3 ${byA.join("/")}`);
console.log("wrote corpus.js", (fs.statSync(path.join(ROOT, "corpus.js")).size / 1e6).toFixed(2), "MB");
