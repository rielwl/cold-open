// Tops up the thin parts of the deck, in place, without a full rebuild:
//   - Sprint subjects for the domains Wikipedia's featured list barely covers
//   - humanities and social-science papers, which the science journals miss
//
//   node tools/extend.mjs        then   node tools/enrich.mjs
//
// Only adds things not already in the deck, so it is safe to re-run. Raw
// fetches are cached in tools/extend_cache.json. New items have no ratings row
// yet; label them (see AGENTS.md) or they stay off Date night / Talkable.
import fs from "node:fs";
import path from "node:path";
import { TOOLS, MAIL, OPENALEX_AUTH, key, readCorpus, writeCorpus, getJSON, clip, deabstract, pageCount } from "./lib.mjs";

const CACHE = path.join(TOOLS, "extend_cache.json");
const UA = { "User-Agent": "ColdOpen/1.1 (https://github.com/rielwl/cold-open" + (MAIL ? "; " + MAIL : "") + ")" };

const TOPIC_TARGET = 420;   // per domain, counting what's already there
const MIN_BYTES = 9000;     // was 12,000 in topup.py; 9k keeps more real articles
const SEEDCATS = {
  "Chemistry & materials": ["Chemistry","Chemical elements","Chemical compounds","Materials science",
    "Metallurgy","Polymers","Minerals","Chemical processes","Analytical chemistry","Organic compounds",
    "Pigments","Explosives","Glass","Dyes","Poisons","Alloys"],
  "Mind & behaviour": ["Psychology","Cognitive science","Neuroscience","Consciousness studies",
    "Human behavior","Memory","Perception","Sleep","Cognitive biases","Psychological theories","Emotion",
    "Psychological experiments","Optical illusions","Decision theory","Habits","Dreams","Social psychology"],
  "Maths & computing": ["Mathematics","Number theory","Geometry","Mathematical problems","Algorithms",
    "Theoretical computer science","Cryptography","Mathematical paradoxes","Probability theory",
    "History of computing","Graph theory","Recreational mathematics","Unsolved problems in mathematics",
    "Early computers","Ciphers","Topology"],
  "Medicine & the body": ["Medicine","Human anatomy","Human physiology","Medical treatments",
    "Surgical procedures","Pharmacology","Epidemiology","Human genetics","Senses","Immunology",
    "History of medicine","Vaccines","Pandemics","Medical devices","Anesthesia","Parasitic diseases"],
  "Physics & space": ["Physics","Optics","Acoustics","Thermodynamics","Quantum mechanics",
    "Astronomical instruments","Space probes","Particle physics","Physical phenomena","Crewed spacecraft",
    "Comets","Meteorites","Timekeeping","Physics experiments"],
  "Art & design": ["Painting techniques","Typography","Typefaces","Graphic design","Sculpture",
    "Art movements","Ceramics","Printmaking","Industrial design","Textile arts","Musical instruments",
    "Calligraphy","Maps","Architectural styles"],
};
const BAD_TOPIC = /^(List of|Lists of|Index of|Outline of|Timeline of|Glossary of|History of)\b|\(disambiguation\)/i;

// OpenAlex fields/subfields -> our domains, for the humanities pull. Labelling corrects the rest.
const PAPER_QUERIES = [
  { filter: "primary_topic.field.id:fields/12", pages: 3 },          // Arts and Humanities
  { filter: "primary_topic.subfield.id:subfields/3310", pages: 2 },  // Linguistics and Language
  { filter: "primary_topic.subfield.id:subfields/1202", pages: 1 },  // History
  { filter: "primary_topic.subfield.id:subfields/1204", pages: 1 },  // Archaeology
];
const SUB2DOM = { "History":"History & archaeology", "Archeology":"History & archaeology",
  "Classics":"History & archaeology", "Music":"Art & design", "Visual Arts and Performing Arts":"Art & design" };
const BAD_PAPER = /\b(systematic review|meta-analys|scoping review|study protocol|corrigendum|erratum|editorial|correction to|reply to|comment on|response to|book review|introduction to the special|guidelines?|questionnaire|psychometric|validation of|scale development)\b/i;

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : { cats: {}, pages: {}, works: {} };
const save = () => fs.writeFileSync(CACHE, JSON.stringify(cache));
const corpus = readCorpus();

/* ---------- Wikipedia subjects ---------- */
const WP = "https://en.wikipedia.org/w/api.php?format=json&formatversion=2&";
async function members(cat, ns){
  const ck = ns + ":" + cat;
  if(cache.cats[ck]) return cache.cats[ck];
  let out = [], cont = "";
  for(let i = 0; i < 4; i++){
    const d = await getJSON(WP + "action=query&list=categorymembers&cmlimit=500&cmnamespace=" + ns
      + "&cmtitle=" + encodeURIComponent("Category:" + cat) + (cont ? "&cmcontinue=" + encodeURIComponent(cont) : ""), UA);
    if(!d) break;
    out = out.concat((d.query && d.query.categorymembers || []).map(m => m.title));
    cont = d.continue && d.continue.cmcontinue;
    if(!cont) break;
  }
  return (cache.cats[ck] = out);
}
async function hydrate(titles){
  const todo = titles.filter(t => !(t in cache.pages));
  for(let i = 0; i < todo.length; i += 20){
    const batch = todo.slice(i, i + 20);
    const d = await getJSON(WP + "action=query&prop=extracts|info&exintro=1&explaintext=1&inprop=url&redirects=1&titles="
      + encodeURIComponent(batch.join("|")), UA);
    for(const t of batch) cache.pages[t] = null;
    for(const p of (d && d.query && d.query.pages) || []){
      if(p.missing || !p.extract) continue;
      cache.pages[p.title] = { x: p.extract, len: p.length || 0, u: p.fullurl || "" };
    }
    // redirects land under the target title; map the asked-for title too
    for(const r of (d && d.query && d.query.redirects) || []) cache.pages[r.from] = cache.pages[r.to] || null;
    if(i % 400 === 0){ save(); process.stdout.write("."); }
  }
  save();
}

const have = new Set(corpus.topics.map(t => key(t.t)));
const count = {};
corpus.topics.forEach(t => count[t.d] = (count[t.d] || 0) + 1);
let addedTopics = 0;
for(const [dom, cats] of Object.entries(SEEDCATS)){
  const want = TOPIC_TARGET - (count[dom] || 0);
  if(want <= 0) continue;
  let titles = new Set();
  for(const c of cats){
    (await members(c, 0)).forEach(t => titles.add(t));
    for(const s of (await members(c, 14)).slice(0, 20))
      (await members(s.replace(/^Category:/, ""), 0)).forEach(t => titles.add(t));
  }
  titles = [...titles].filter(t => !BAD_TOPIC.test(t) && !have.has(key(t)));
  process.stdout.write(`${dom}: ${titles.length} candidates `);
  await hydrate(titles);
  const rows = titles.map(t => ({ t, p: cache.pages[t] }))
    .filter(r => r.p && r.p.len >= MIN_BYTES && r.p.x.replace(/\s+/g, " ").length >= 220)
    .sort((a, b) => b.p.len - a.p.len).slice(0, want);
  for(const { t, p } of rows){
    const z = p.len < 12000 ? 0 : p.len < 30000 ? 1 : p.len < 70000 ? 2 : 3;
    corpus.topics.push({ t, x: clip(p.x, 300), u: p.u, d: dom, o: 0, z });
    have.add(key(t)); addedTopics++;
  }
  console.log(`-> added ${rows.length}`);
}

/* ---------- humanities papers ---------- */
const havePapers = new Set(corpus.papers.map(p => key(p.t)));
let addedPapers = 0;
for(const q of PAPER_QUERIES){
  let cursor = "*";
  for(let pg = 0; pg < q.pages && cursor; pg++){
    const ck = q.filter + "#" + pg;
    let res = cache.works[ck];
    if(!res){
      const j = await getJSON("https://api.openalex.org/works?per-page=200&sort=cited_by_count:desc&cursor=" + cursor
        + "&select=title,publication_year,cited_by_count,primary_location,best_oa_location,abstract_inverted_index,primary_topic,biblio,doi"
        + "&filter=" + q.filter + ",is_oa:true,type:article,has_abstract:true,cited_by_count:>25,from_publication_date:2004-01-01"
        + OPENALEX_AUTH);
      if(!j) break;
      res = cache.works[ck] = { next: j.meta && j.meta.next_cursor, results: j.results || [] };
      save();
    }
    cursor = res.next;
    for(const w of res.results){
      const t = (w.title || "").trim(), ab = deabstract(w.abstract_inverted_index);
      if(t.length < 15 || BAD_PAPER.test(t) || havePapers.has(key(t))) continue;
      if(ab.length < 400 || ab.length > 3000) continue;
      const oa = w.best_oa_location || {}, src = (w.primary_location || {}).source || {};
      const u = w.doi || oa.landing_page_url || oa.pdf_url;
      if(!u || !src.display_name) continue;
      const pt = w.primary_topic || {}, sub = (pt.subfield || {}).display_name || "";
      const p = { t, x: clip(ab, 760), u, j: src.display_name, y: w.publication_year, c: w.cited_by_count,
                  d: SUB2DOM[sub] || "Language & culture", f: sub };
      if(oa.pdf_url) p.pdf = oa.pdf_url;
      const pg = pageCount(w.biblio);
      if(pg) p.pg = pg;
      corpus.papers.push(p); havePapers.add(key(t)); addedPapers++;
    }
  }
}

writeCorpus(corpus);
console.log(`added ${addedTopics} subjects and ${addedPapers} papers -> corpus.js now ${corpus.topics.length} / ${corpus.papers.length}`);
