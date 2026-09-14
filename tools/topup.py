# -*- coding: utf-8 -*-
import json, re, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

UA = {"User-Agent": "TopicSeedBuilder/1.0 (personal research app)"}
API = "https://en.wikipedia.org/w/api.php?"

def api(**p):
    p.setdefault("format","json"); p.setdefault("formatversion","2")
    url = API + urllib.parse.urlencode(p)
    for a in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=35) as r:
                return json.load(r)
        except Exception:
            time.sleep(1.5*(a+1))
    return None

SEEDCATS = {
 "Chemistry & materials": ["Chemistry","Chemical elements","Chemical compounds","Materials science",
    "Metallurgy","Polymers","Minerals","Chemical processes","Analytical chemistry","Organic compounds"],
 "Mind & behaviour": ["Psychology","Cognitive science","Neuroscience","Consciousness studies",
    "Human behavior","Memory","Perception","Sleep","Cognitive biases","Psychological theories","Emotion"],
 "Maths & computing": ["Mathematics","Number theory","Geometry","Mathematical problems","Algorithms",
    "Theoretical computer science","Cryptography","Mathematical paradoxes","Probability theory",
    "History of computing","Graph theory"],
 "Medicine & the body": ["Medicine","Human anatomy","Human physiology","Medical treatments",
    "Surgical procedures","Pharmacology","Epidemiology","Human genetics","Senses","Immunology"],
}

def members(cat, kinds="page"):
    out, cont = [], None
    for _ in range(4):
        kw = dict(action="query", list="categorymembers", cmtitle="Category:"+cat,
                  cmlimit="500", cmnamespace="0" if kinds=="page" else "14")
        if cont: kw["cmcontinue"] = cont
        d = api(**kw)
        if not d: break
        out += [m["title"] for m in d.get("query",{}).get("categorymembers",[])]
        cont = d.get("continue",{}).get("cmcontinue")
        if not cont: break
    return out

def collect(domain, cats):
    titles, subs = set(), []
    for c in cats:
        titles.update(members(c, "page"))
        subs += members(c, "subcat")[:26]
    for s in subs[:190]:
        titles.update(members(s.replace("Category:",""), "page"))
    return domain, sorted(titles)

pools = {}
with ThreadPoolExecutor(max_workers=4) as ex:
    for dom, ts in ex.map(lambda kv: collect(*kv), SEEDCATS.items()):
        pools[dom] = ts
        print(f"{dom:28s} candidates {len(ts)}", flush=True)

BAD = re.compile(r"^(List of|Lists of|Index of|Outline of|Timeline of|Glossary of)\b|\(disambiguation\)", re.I)
allt = sorted({t for ts in pools.values() for t in ts if not BAD.search(t)})
print("hydrating", len(allt), flush=True)

def fetch(batch):
    q = urllib.parse.urlencode({"action":"query","format":"json","formatversion":"2",
        "titles":"|".join(batch),"prop":"extracts|info","exintro":1,"explaintext":1,
        "inprop":"url","redirects":1})
    for a in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(API+q, headers=UA), timeout=35) as r:
                return json.load(r).get("query",{}).get("pages",[])
        except Exception:
            time.sleep(1.5*(a+1))
    return []

hyd = {}
batches = [allt[i:i+20] for i in range(0,len(allt),20)]
with ThreadPoolExecutor(max_workers=8) as ex:
    for pages in ex.map(fetch, batches):
        for p in pages:
            if p.get("missing") or "extract" not in p: continue
            hyd[p["title"]] = {"extract":p["extract"],"length":p.get("length",0),"url":p.get("fullurl","")}

out = {}
for dom, ts in pools.items():
    rows = []
    for t in ts:
        p = hyd.get(t)
        if not p or p["length"] < 12000: continue
        ex_ = re.sub(r"\s+"," ",p["extract"]).strip()
        if len(ex_) < 220: continue
        rows.append({"t":t,"x":ex_,"u":p["url"],"length":p["length"]})
    rows.sort(key=lambda r:-r["length"])
    out[dom] = rows[:420]
    print(f"{dom:28s} kept {len(out[dom])}", flush=True)

json.dump(out, open("wiki_topup.json","w",encoding="utf-8"))
print("saved wiki_topup.json", flush=True)
