import json
from concurrent.futures import ThreadPoolExecutor
from web import wiki_pages

c = json.load(open("wiki_candidates.json", encoding="utf-8"))
titles = sorted(set(c["unusual"]) | set(c["featured"]))
batches = [titles[i:i+20] for i in range(0, len(titles), 20)]
print("batches", len(batches), flush=True)

out, done = {}, 0
with ThreadPoolExecutor(max_workers=8) as ex:
    for pages in ex.map(wiki_pages, batches):
        done += 1
        for p in pages:
            if p.get("missing") or "extract" not in p: continue
            out[p["title"]] = {"title": p["title"], "extract": p["extract"],
                               "length": p.get("length", 0), "url": p.get("fullurl", "")}
        if done % 100 == 0: print(f"  {done}/{len(batches)} -> {len(out)}", flush=True)

json.dump(out, open("wiki_hydrated.json", "w", encoding="utf-8"))
print("DONE", len(out), flush=True)
