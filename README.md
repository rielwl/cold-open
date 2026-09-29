# Cold Open

A machine that deals you something to be curious about, then starts a clock.

Two modes:

- **Sprint (solo)** — draws an unfamiliar subject plus five *guiding questions*,
  one for each card of your talk (what it is, how it works, why it matters, the
  twist, what's still open). Research it against the clock, then give a talk of
  under five minutes. **Talkable** (on by default) skips subjects too thin to fill five minutes.
- **Paper (two of you)** — draws an open-access paper plus one of 12 *reading
  lenses*, so you each read for something specific rather than nodding along.
  **Date night** (on by default) sticks to papers two non-specialists can follow.
  **Copy invite** gives you a message to send the other person; **Print handout**
  gives you a sheet each with the lens, questions to talk about, and room for notes.

The reading, note-taking and annotation all happen on paper. The app only picks
the subject and runs the clock.

**Live page:** https://rielwl.github.io/cold-open/ (GitHub Pages; redeploys on every push to `main`)

Coming back to this after a while? Start with [NEXT-STEPS.md](NEXT-STEPS.md) —
current state, what's unverified, known limits and the backlog. Coding agents:
house rules are in [AGENTS.md](AGENTS.md).

## Running it

It's a static page. Open `index.html` in a browser, or serve the folder:

```sh
npx serve .              # or: python -m http.server 8000
```

The look is "Airmail": every card is an airmail letter with a stamp and a
postmark. The design spec (tokens, type scale, component states) is in
[docs/airmail-design.md](docs/airmail-design.md).

## How it's put together

- `index.html` — the whole app. No build step, no dependencies. Settings and the
  session log persist to `localStorage`; **export** / **import** under the log
  move it between browsers or devices.
- `corpus.js` — the deck, as a single `window.SEEDS` object (~5 MB). Committed
  deliberately: the app has no network access at runtime, so the data ships with it.
- `prompts.js` — the Sprint guiding questions and Paper lenses, as plain data. Edit and
  reload; no rebuild.
- `tools/` — the scripts that build `corpus.js` from live sources, plus
  `paper_ratings.tsv` (below).

## The deck

5,502 subjects and 4,163 papers, drawn from real sources rather than generated.

**Subjects** come from three places:

1. Wikipedia's [unusual articles](https://en.wikipedia.org/wiki/Wikipedia:Unusual_articles)
   list, parsed from the themed subpages (`/Science`, `/Language`, `/Food`, …) so
   each entry keeps the volunteers' own one-line blurb. Sports and pop-culture
   subpages are excluded.
2. Featured articles, restricted to science, history, engineering and
   humanities headings — warships, football and discographies are dropped.
3. Category top-ups for the domains Wikipedia's featured list covers thinly
   (chemistry, psychology, maths, medicine, physics, art), from `topup.py` and
   `extend.mjs`.

**Papers** come from OpenAlex, restricted to open-access research articles in
eLife, PLOS, the Royal Society journals, PNAS, *Psychological Science*, *Journal
of Economic Perspectives* and others, with a citation band and a title blacklist
that removes protocols, errata, genome announcements and methodology papers.
`extend.mjs` adds open-access Arts & Humanities, linguistics, history and
archaeology papers, because the science journals barely cover them.

Every card also carries hand-reviewed labels, kept in two committed files:

- `tools/paper_ratings.tsv`: how easy the paper is for two non-specialists
  (0–3; Date night deals 2 and 3), its real subject area (OpenAlex's own topic
  files the 1918 flu under maths, for example), and whether it reports its own
  data, so "find the effect size" isn't dealt for a theory paper.
- `tools/topic_ratings.tsv`: whether a Sprint subject has five minutes of talk in
  it (0–3; Talkable deals 2 and 3), and its real subject area.

Page counts and direct PDF links come from OpenAlex.

### Correcting a rating

Every card has a **fix this** link under its details. It lets you change the
score, the subject area and (for papers) whether it reports its own data. The
fix applies straight away on that device. Passing a card as **looks thin** also
lowers its score by one.

To make fixes permanent for everyone, use **export fixes** in the log, then:

```sh
node tools/enrich.mjs cold-open-fixes-2026-10-01.json   # folds them into the .tsv files
git commit -am "Rating fixes" && git push
```

The full log export carries your fixes too, so importing it on another device
brings them across.

### Depth filtering

Every subject carries a depth band shown on the card (`brief` / `moderate` /
`substantial` / `very long`), derived from the article's byte length. The
talkability label is now the main filter; the byte floors (10,000 for oddities in
`tools/build5.py`, 9,000 for top-ups in `tools/extend.mjs`) only keep stubs out.

### Rebuilding the deck

Run in order, from `tools/`. Each step writes intermediate JSON that the next one
reads. They hit live APIs, so expect a few minutes.

```sh
python fetch_wiki.py     # candidate titles: unusual list + featured articles
python hydrate2.py       # extracts and article lengths
python unusual5.py       # themed oddity tables, with their curated blurbs
python topup.py          # extra subjects for the thin domains
python papers3.py        # open-access papers, classified by OpenAlex field
python build5.py         # writes tools/corpus.js
node extend.mjs          # more subjects for thin areas + humanities papers
node enrich.mjs          # ratings, page counts, PDF links; writes ./corpus.js
```

`extend.mjs` and `enrich.mjs` also work on their own against the committed
`corpus.js`, which is how the deck is usually updated. Both cache what they fetch
(`tools/*_cache.json`, not committed), so re-runs are quick.

**OpenAlex.** Since February 2026 OpenAlex meters its API. Looking up one work by
ID is free, a filtered list costs $0.0001, and a search costs $0.001. Without a
key you get about $0.10 a day. A free key from openalex.org gives $1 a day. The
scripts only use lists and DOI batches (50 papers per call), so a full enrich is
about 70 calls and the humanities pull about 7. For big rebuilds, set a key:

```sh
export OPENALEX_API_KEY=...        # PowerShell: $env:OPENALEX_API_KEY="..."
export CONTACT_EMAIL=you@example.com   # optional; sent to OpenAlex/NCBI as the contact
```

Never commit either value; they're read from the environment only.

Anything new with no ratings row defaults to 1, so it stays off Date night and
Talkable until someone labels it (see AGENTS.md) or fixes it in the app.

## Hosting

GitHub Pages, deployed by `.github/workflows/pages.yml` on every push to `main`.
It publishes only `index.html`, `corpus.js` and `prompts.js`; `tools/` stays in
the repo. To deploy, just `git push`. The Actions tab shows each run, and
**Run workflow** there redeploys by hand.

An older copy still exists as a Claude artifact
(https://claude.ai/code/artifact/b6bdc9cf-860b-44f4-a357-964ee43bf47f). It is no
longer updated.

Nothing here needs a database. The log is per-device by design; use export and
import to carry it across.
