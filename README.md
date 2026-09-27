# Cold Open

A machine that deals you something to be curious about, then starts a clock.

Two modes:

- **Sprint (solo)** — draws an unfamiliar subject plus one of 20 *angles* you're
  required to take. Research it against the clock, then give a talk of under five
  minutes.
- **Paper (two of you)** — draws an open-access paper plus one of 12 *reading
  lenses*, so you each read for something specific rather than nodding along.
  **Date night** (on by default) sticks to papers two non-specialists can follow.
  **Copy invite** gives you a message to send the other person; **Print handout**
  gives you a sheet each with the lens, questions to talk about, and room for notes.

The reading, note-taking and annotation all happen on paper. The app only picks
the subject and runs the clock.

**Live page:** https://claude.ai/code/artifact/b6bdc9cf-860b-44f4-a357-964ee43bf47f

Coming back to this after a while? Start with [NEXT-STEPS.md](NEXT-STEPS.md) —
current state, what's unverified, known limits and the backlog. Coding agents:
house rules are in [AGENTS.md](AGENTS.md).

## Running it

It's a static page. Open `index.html` in a browser, or serve the folder:

```sh
npx serve .              # or: python -m http.server 8000
```

The only thing that doesn't work outside the Claude artifact viewer is the
**Sharpen it / Reading notes** button, which asks Claude for threads to chase on
that specific subject. It relies on `window.claude`, which only exists inside the
viewer; everywhere else the button simply doesn't render.

## How it's put together

- `index.html` — the whole app. No build step, no dependencies. Settings and the
  session log persist to `localStorage`; **export** / **import** under the log
  move it between browsers or devices.
- `corpus.js` — the deck, as a single `window.SEEDS` object (~5 MB). Committed
  deliberately: the app has no network access at runtime, so the data ships with it.
- `prompts.js` — the Sprint angles and Paper lenses, as plain data. Edit and
  reload; no rebuild.
- `tools/` — the scripts that build `corpus.js` from live sources, plus
  `paper_ratings.tsv` (below).

## The deck

4,360 subjects and 3,230 papers, drawn from real sources rather than generated.

**Subjects** come from three places:

1. Wikipedia's [unusual articles](https://en.wikipedia.org/wiki/Wikipedia:Unusual_articles)
   list, parsed from the themed subpages (`/Science`, `/Language`, `/Food`, …) so
   each entry keeps the volunteers' own one-line blurb. Sports and pop-culture
   subpages are excluded.
2. Featured articles, restricted to science, history, engineering and
   humanities headings — warships, football and discographies are dropped.
3. Category top-ups for the domains Wikipedia's featured list covers thinly
   (chemistry, psychology, mathematics, medicine).

**Papers** come from OpenAlex, restricted to open-access research articles in
eLife, PLOS, the Royal Society journals, PNAS, *Psychological Science*, *Journal
of Economic Perspectives* and others, with a citation band and a title blacklist
that removes protocols, errata, genome announcements and methodology papers.

Every paper also carries three hand-reviewed labels from `tools/paper_ratings.tsv`:
how easy it is for two non-specialists (0–3; Date night deals 2 and 3), its real
subject area (OpenAlex's own topic files the 1918 flu under maths, for example),
and whether it reports its own data, so "find the effect size" isn't dealt for a
theory paper. Page counts and direct PDF links come from OpenAlex.

### Depth filtering

Every subject carries a depth band shown on the card (`brief` / `moderate` /
`substantial` / `very long`), derived from the article's byte length. Oddities
need at least 10,000 bytes to make the cut — below that you get one-joke entries
that can't sustain a five-minute talk. That threshold is the single number worth
tuning; it lives in `tools/build5.py`.

### Rebuilding the deck

Run in order, from `tools/`. Each step writes intermediate JSON that the next one
reads. They hit live APIs and are rate-limit sensitive, so expect a few minutes.

```sh
python fetch_wiki.py     # candidate titles: unusual list + featured articles
python hydrate2.py       # extracts and article lengths
python unusual5.py       # themed oddity tables, with their curated blurbs
python topup.py          # extra subjects for the thin domains
python papers3.py        # open-access papers, classified by OpenAlex field
python build5.py         # writes tools/corpus.js
node enrich.mjs          # ratings, page counts, PDF links; writes ./corpus.js
```

`enrich.mjs` can also be re-run on its own after editing `paper_ratings.tsv`.
It looks papers up by DOI, 50 per request, because keyless OpenAlex now has a
small daily credit budget that title searches burn through; results are cached
in `tools/openalex_cache.json`. Papers with no ratings row (anything new from a
rebuild) default to approachability 1, so they stay off Date night until
someone labels them.

## Hosting

The live copy is a Claude artifact, which is what gives it the Claude-backed
"sharpen it" feature. The page is otherwise entirely static, so it will run from
anywhere that serves files — including GitHub Pages, if the repo is ever made
public and you don't mind losing that one button.

Nothing here needs a database. The log is per-device by design; use export and
import to carry it across.
