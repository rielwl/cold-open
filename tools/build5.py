# -*- coding: utf-8 -*-
import json, os, random, re, collections
from config import DOMAINS, PREFIX_DOMAINS, SHAPES, LENSES

random.seed(11)
HEAD2DOM = {h: d for d, hs in DOMAINS.items() for h in hs}
BAD_TITLE = re.compile(r"^(List of|Lists of|Index of|Outline of|Timeline of|Glossary of)\b|\(disambiguation\)", re.I)
JUNK = re.compile(r"\b(F\.?C\.?|A\.?F\.?C\.?)\b|\((19|20)\d\d film\)|\(album\)|\(song\)|\(TV series\)|"
                  r"\b(discography|filmography)\b|\b\d{4}[-\u2013]\d{2,4} .*season\b", re.I)

def clip(s, n):
    s = re.sub(r"\s+", " ", s or "").strip()
    return s if len(s) <= n else s[:n].rsplit(" ", 1)[0] + "\u2026"

def dom_from_headings(hs):
    for h in hs:
        if h in HEAD2DOM: return HEAD2DOM[h]
        for pre, d in PREFIX_DOMAINS.items():
            if h.startswith(pre): return d
    return None

cand = json.load(open("wiki_candidates.json", encoding="utf-8"))
hyd  = json.load(open("wiki_hydrated.json", encoding="utf-8"))
themed = json.load(open("unusual_themed.json", encoding="utf-8"))
featured = cand["featured"]

topics, byname = [], {}
def add(title, extract, url, dom, odd, blurb="", size=0):
    if title in byname or BAD_TITLE.search(title) or JUNK.search(title): return
    ex = clip(extract, 300)
    if len(ex) < 180: return
    r = {"t": title, "x": ex, "u": url, "d": dom, "o": 1 if odd else 0,
         "z": 0 if size < 12000 else 1 if size < 30000 else 2 if size < 70000 else 3}
    if blurb: r["b"] = clip(blurb, 200)
    byname[title] = r; topics.append(r)

# 1. curated oddities (shallower depth bar - the blurb carries them)
odd_n = 0
for sub, v in themed.items():
    for row in v["rows"]:
        p = hyd.get(row["t"])
        if not p or p["length"] < 10000: continue
        add(row["t"], p["extract"], p["url"], v["domain"], True, row.get("b",""), p["length"])
        odd_n += 1

# 2. featured articles under curated headings
for title, p in hyd.items():
    if p["length"] < 9000: continue
    dom = dom_from_headings(featured.get(title, []))
    if dom: add(title, p["extract"], p["url"], dom, False, "", p["length"])

# 3. category top-ups for the thin domains
if os.path.exists("wiki_topup.json"):
    for dom, rows in json.load(open("wiki_topup.json", encoding="utf-8")).items():
        for r in rows:
            add(r["t"], r["x"], r["u"], dom, False, "", r.get("length", 0))

random.shuffle(topics)
bucket, kept = collections.Counter(), []
for t in topics:
    if bucket[t["d"]] >= 520: continue
    bucket[t["d"]] += 1; kept.append(t)
topics = kept
print("TOPICS", len(topics), "(oddities:", sum(t["o"] for t in topics),
      "| with blurb:", sum(1 for t in topics if t.get("b")), ")")
for k, v in bucket.most_common(): print(f"   {v:5d}  {k}")

raw = json.load(open("papers_raw2.json", encoding="utf-8"))
seen, papers = set(), []
for p in raw:
    key = re.sub(r"\W+", "", p["title"].lower())[:70]
    if key in seen: continue
    seen.add(key)
    ab = clip(p["abstract"], 760)
    if len(ab) < 360: continue
    papers.append({"t": p["title"], "x": ab, "u": p["url"], "j": p["journal"],
                   "y": p["year"], "c": p["cites"], "d": p["dom"],
                   "f": p.get("subfield") or p.get("field") or ""})
random.shuffle(papers)
pb, pk = collections.Counter(), []
for p in papers:
    if pb[p["d"]] >= 360: continue
    pb[p["d"]] += 1; pk.append(p)
papers = pk
print("PAPERS", len(papers))
for k, v in pb.most_common(): print(f"   {v:5d}  {k}")

corpus = {"topics": topics, "papers": papers,
          "shapes": [{"n": n, "p": d} for n, d in SHAPES],
          "lenses": [{"n": n, "p": d} for n, d in LENSES],
          "domains": list(DOMAINS.keys())}
with open("corpus.js", "w", encoding="utf-8") as f:
    f.write("window.SEEDS=")
    json.dump(corpus, f, ensure_ascii=False, separators=(",", ":"))
    f.write(";")
print("corpus.js", round(os.path.getsize("corpus.js")/1e6, 2), "MB")
