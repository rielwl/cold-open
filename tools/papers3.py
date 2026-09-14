# -*- coding: utf-8 -*-
import json, re, time, urllib.parse, urllib.request, threading
from concurrent.futures import ThreadPoolExecutor

MAIL = "23545713+rielwl@users.noreply.github.com"
UA = {"User-Agent": f"TopicSeedBuilder/1.0 (mailto:{MAIL})"}

def get(url):
    for a in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45) as r:
                return json.load(r)
        except Exception:
            if a == 3: return None
            time.sleep(1.5*(a+1))

FIELD2DOM = {
 "Biochemistry, Genetics and Molecular Biology":"Life & evolution",
 "Agricultural and Biological Sciences":"Life & evolution",
 "Immunology and Microbiology":"Life & evolution",
 "Neuroscience":"Mind & behaviour", "Psychology":"Mind & behaviour",
 "Medicine":"Medicine & the body", "Nursing":"Medicine & the body",
 "Dentistry":"Medicine & the body", "Health Professions":"Medicine & the body",
 "Pharmacology, Toxicology and Pharmaceutics":"Medicine & the body",
 "Veterinary":"Medicine & the body",
 "Physics and Astronomy":"Physics & space",
 "Chemistry":"Chemistry & materials", "Materials Science":"Chemistry & materials",
 "Chemical Engineering":"Chemistry & materials",
 "Earth and Planetary Sciences":"Earth & climate", "Environmental Science":"Earth & climate",
 "Computer Science":"Maths & computing", "Mathematics":"Maths & computing",
 "Decision Sciences":"Maths & computing",
 "Economics, Econometrics and Finance":"Society, law & money",
 "Business, Management and Accounting":"Society, law & money",
 "Social Sciences":"Society, law & money",
 "Arts and Humanities":"Language & culture",
 "Engineering":"Engineering & built things", "Energy":"Engineering & built things",
}

JOURNALS = ["eLife","PLoS Biology","Royal Society Open Science",
            "Proceedings of the Royal Society B","Science Advances",
            "Nature Communications","Proceedings of the National Academy of Sciences",
            "Journal of Experimental Biology","Cognition","Psychological Science",
            "Journal of Economic Perspectives","Philosophical Transactions of the Royal Society B",
            "Current Biology","PLoS ONE","Nature Human Behaviour","Animal Behaviour",
            "Journal of the Royal Society Interface","American Economic Review"]

BAD_TITLE = re.compile(r"\b(systematic review|meta-analys|scoping review|study protocol|corrigendum|"
   r"erratum|editorial|correction to|reply to|comment on|response to|author response|"
   r"validation of|reliability of|questionnaire|psychometric|guidelines?|consensus statement|"
   r"draft genome|genome sequence of|complete genome|crystal structure of|"
   r"supplementary|dataset|data descriptor|cohort profile|trial protocol|scale development)\b", re.I)

def deabstract(inv):
    if not inv: return ""
    pos = {}
    for w, idxs in inv.items():
        for i in idxs: pos[i] = w
    return " ".join(pos[i] for i in sorted(pos)) if pos else ""

lock = threading.Lock(); allout = []

def do_journal(jname):
    d = get("https://api.openalex.org/sources?search=" + urllib.parse.quote(jname) + f"&per-page=1&mailto={MAIL}")
    if not d or not d.get("results"): return
    sid = d["results"][0]["id"].split("/")[-1]; disp = d["results"][0]["display_name"]
    got, cursor = [], "*"
    for _ in range(6):
        url = ("https://api.openalex.org/works?filter="
               f"primary_location.source.id:{sid},is_oa:true,type:article,"
               "cited_by_count:>40,from_publication_date:2004-01-01"
               f"&sort=cited_by_count:desc&per-page=200&cursor={cursor}&mailto={MAIL}")
        r = get(url)
        if not r or not r.get("results"): break
        for w in r["results"]:
            t = (w.get("title") or "").strip()
            if not t or len(t) < 15 or BAD_TITLE.search(t): continue
            ab = deabstract(w.get("abstract_inverted_index"))
            if len(ab) < 400 or len(ab) > 3000: continue
            loc = w.get("best_oa_location") or {}
            link = loc.get("pdf_url") or loc.get("landing_page_url") or w.get("doi")
            if not link: continue
            pt = w.get("primary_topic") or {}
            field = ((pt.get("field") or {}).get("display_name")) or ""
            sub = ((pt.get("subfield") or {}).get("display_name")) or ""
            got.append({"title":t, "year":w.get("publication_year"), "cites":w.get("cited_by_count"),
                        "journal":disp, "url":link, "abstract":ab,
                        "field":field, "subfield":sub,
                        "dom":FIELD2DOM.get(field, "Wildcard")})
        cursor = r["meta"].get("next_cursor")
        if not cursor: break
    with lock:
        allout.extend(got); print(f"{disp[:44]:46s} {len(got)}", flush=True)

with ThreadPoolExecutor(max_workers=6) as ex:
    list(ex.map(do_journal, JOURNALS))
json.dump(allout, open("papers_raw2.json","w",encoding="utf-8"))
import collections
print("TOTAL", len(allout))
for d,n in collections.Counter(p["dom"] for p in allout).most_common(): print(f"   {n:5d}  {d}")
