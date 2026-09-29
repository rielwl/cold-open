import json, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

UA = {"User-Agent": "TopicSeedBuilder/1.0 (https://github.com/rielwl/cold-open)"}
API = "https://en.wikipedia.org/w/api.php?"

def fetch(batch):
    q = urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": "2",
        "titles": "|".join(batch), "prop": "extracts|info",
        "exintro": 1, "explaintext": 1, "inprop": "url", "redirects": 1})
    for a in range(3):
        try:
            req = urllib.request.Request(API + q, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r).get("query", {}).get("pages", [])
        except Exception:
            time.sleep(1.5 * (a + 1))
    return []

c = json.load(open("wiki_candidates.json", encoding="utf-8"))
titles = sorted(set(c["unusual"]) | set(c["featured"]))
batches = [titles[i:i+20] for i in range(0, len(titles), 20)]
print("batches", len(batches), flush=True)

out, done = {}, 0
with ThreadPoolExecutor(max_workers=8) as ex:
    for pages in ex.map(fetch, batches):
        done += 1
        for p in pages:
            if p.get("missing") or "extract" not in p: continue
            out[p["title"]] = {"title": p["title"], "extract": p["extract"],
                               "length": p.get("length", 0), "url": p.get("fullurl", "")}
        if done % 100 == 0: print(f"  {done}/{len(batches)} -> {len(out)}", flush=True)

json.dump(out, open("wiki_hydrated.json", "w", encoding="utf-8"))
print("DONE", len(out), flush=True)
