# -*- coding: utf-8 -*-
import json, re, time, urllib.parse, urllib.request
UA = {"User-Agent":"TopicSeedBuilder/1.0 (personal research app; low volume)"}
API = "https://en.wikipedia.org/w/api.php?"

SUBS = {
 "Science":"Wildcard", "Death":"Wildcard",
 "Mathematics and numbers":"Maths & computing",
 "Technology, inventions and products":"Engineering & built things",
 "Places and infrastructure":"Earth & climate",
 "History":"History & archaeology", "Military":"History & archaeology",
 "Language":"Language & culture", "Folklore":"Language & culture",
 "Religion and spirituality":"Language & culture", "Food":"Language & culture",
 "Society, economy and law":"Society, law & money",
}

def patient(page):
    url = API + urllib.parse.urlencode({"action":"parse","page":page,"prop":"wikitext",
                                        "format":"json","formatversion":"2"})
    for a in range(20):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                return json.load(r).get("parse",{}).get("wikitext","")
        except Exception:
            time.sleep(12)
    return ""

def clean(s):
    s = re.sub(r"<ref[^>]*>.*?</ref>", "", s, flags=re.S)
    s = re.sub(r"<ref[^>]*/>", "", s)
    s = re.sub(r"<!--.*?-->", "", s, flags=re.S)
    s = re.sub(r"\{\{[^{}]*\}\}", "", s)
    s = re.sub(r"\[\[[^\]|]*\|([^\]]*)\]\]", r"\1", s)
    s = re.sub(r"\[\[([^\]]*)\]\]", r"\1", s)
    s = re.sub(r"'''?", "", s)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", s).strip()

TITLE_RE = re.compile(r"^\|\s*(?:\{\{[^{}]*\}\}\s*)*'''\[\[([^\[\]|#]+?)(?:\|[^\[\]]*)?\]\]'''\s*$")

out = {}
for sub, dom in SUBS.items():
    wt = patient("Wikipedia:Unusual articles/" + sub)
    rows, lines = [], wt.split("\n")
    for i, line in enumerate(lines):
        m = TITLE_RE.match(line.strip())
        if not m: continue
        title = m.group(1).strip()
        if title.startswith(("Wikipedia:","Category:","File:","Image:","Portal:","Template:","Help:","Talk:","wikt:",":")):
            continue
        blurb = ""
        for j in range(i+1, min(i+4, len(lines))):
            nxt = lines[j].strip()
            if nxt.startswith("|-") or nxt.startswith("|}"): break
            if nxt.startswith("|"):
                blurb = clean(nxt.lstrip("|").strip()); break
        rows.append({"t": title, "b": blurb})
    out[sub] = {"domain": dom, "rows": rows}
    print(("%-44s %5d -> %s" % (sub[:42], len(rows), dom)), flush=True)
    time.sleep(2.5)

with open("unusual_themed.json","w",encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)
tot = sum(len(v["rows"]) for v in out.values())
withb = sum(1 for v in out.values() for r in v["rows"] if r["b"])
print("TOTAL", tot, "| with blurb:", withb, flush=True)
