import json, re, time, urllib.parse, urllib.request

UA = {"User-Agent": "TopicSeedBuilder/1.0 (personal research-sprint app)"}
API = "https://en.wikipedia.org/w/api.php?"

def api(**params):
    params.setdefault("format", "json")
    params.setdefault("formatversion", "2")
    req = urllib.request.Request(API + urllib.parse.urlencode(params), headers=UA)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.load(r)
        except Exception as e:
            if attempt == 3:
                raise
            time.sleep(2 * (attempt + 1))

# ---------- Pool A: unusual articles ----------
d = api(action="parse", page="Wikipedia:Unusual_articles", prop="links")
unusual = [l["title"] for l in d["parse"]["links"] if l["ns"] == 0 and l.get("exists")]
unusual = sorted(set(unusual))
print("unusual candidates:", len(unusual))

# ---------- Pool B: featured articles, grouped by topic heading ----------
d = api(action="parse", page="Wikipedia:Featured_articles", prop="wikitext")
wt = d["parse"]["wikitext"]
featured = {}
topic = None
for line in wt.split("\n"):
    h = re.match(r"^==+\s*(.+?)\s*==+\s*$", line)
    if h:
        topic = h.group(1).strip()
        continue
    if topic:
        for t in re.findall(r"\[\[([^\[\]|#]+?)(?:\|[^\[\]]*)?\]\]", line):
            t = t.strip()
            if t and not t.startswith(("Wikipedia:", "Category:", "File:", "Image:", "Portal:", "Template:", "Help:")):
                featured.setdefault(t, set()).add(topic)
print("featured candidates:", len(featured), "| topics:", len(set(x for v in featured.values() for x in v)))

json.dump({"unusual": unusual,
           "featured": {k: sorted(v) for k, v in featured.items()}},
          open("wiki_candidates.json", "w", encoding="utf-8"))
print("saved wiki_candidates.json")
