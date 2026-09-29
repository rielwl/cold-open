# Where this was left off

Last updated: 27 September 2026, after the second pass (ratings you can fix, a
bigger deck, OpenAlex budget handling).

## State: working and in use

- **Live page:** https://rielwl.github.io/cold-open/ (GitHub Pages)
- **Repo:** https://github.com/rielwl/cold-open (public)
- **Deck:** 5,502 subjects (3,054 talkable) and 4,163 papers (1,763 date-night
  friendly); 30 Sprint guiding questions in 5 groups, 12 reading lenses

## Done so far

**First pass (date night):** the clock bar showed on load and never hid; re-deal
left the old timer running; the chime was blocked. Added the Date night filter,
lenses matched to the paper, page counts and PDF links, Copy invite, Print
handout, an adjustable talk clock, pass reasons with cooldowns, log
export/import, `prompts.js`, AGENTS.md.

**Second pass:**

- **Ratings can be corrected in the app.** Every card has **fix this** (score,
  area, and for papers data vs theory). Fixes apply straight away on that device,
  travel with the log export, and **export fixes** produces a file that
  `node tools/enrich.mjs <file>.json` folds into the committed ratings.
- **"Looks thin" feeds back.** Passing for that reason lowers the card's score by
  one, as a fix.
- **Sprint subjects are labelled** like the papers: talkability 0-3 and their real
  area (`tools/topic_ratings.tsv`). **Talkable**, on by default, deals 2s and 3s.
  This replaces the byte-length depth floor as the real filter, and fixes misfiles
  like Jaxa (a 17th-century state) under Earth & climate.
- **Thin topic areas filled.** `tools/extend.mjs` pulled Wikipedia categories for
  Chemistry, Mind, Maths, Medicine, Physics and Art, with a 9,000-byte floor
  (down from 12,000) and a cache. Kept 1,143 after dropping stubs and duplicates.
- **Humanities papers.** The same script pulled open-access Arts & Humanities,
  linguistics, history and archaeology papers from OpenAlex (7 cheap list calls).
  Date-night Language & culture papers went from 30 to 151, History from 23 to 89.
  133 were dropped as non-English, not research articles, or methods-only.
- **`x` means drop.** A score of `x` in either ratings file removes the card from
  the deck at build time.
- **OpenAlex budget.** Measured: single-work lookups are free, lists $0.0001,
  searches $0.001, against about $0.10 a day without a key. All scripts now use
  lists and DOI batches, have 30-second timeouts, and read `OPENALEX_API_KEY`
  if it's set (a free key gives $1/day).

**Third pass:** moved to GitHub Pages (public repo, history scrubbed of the
personal email; the old private repo is `rielwl/cold-open-archive`). Sprint cards
now get five guiding questions, one per talk card, instead of a single required
angle.

## Picking it back up

1. **Deploying is `git push` to `main`.** GitHub Actions publishes the page; see
   the Actions tab if it doesn't update.
2. **Usual update loop:** `node tools/extend.mjs` (optional, adds cards), label
   anything new (AGENTS.md), `node tools/enrich.mjs [fixes.json]`, commit.
3. **Python isn't installed** on the Windows machine this was last worked on; the
   newer steps are Node. The original Python pipeline is untouched and still
   documented in the README, but its intermediate files aren't in the repo, so a
   full rebuild starts from scratch.

## Not yet verified

- [ ] Copy invite on a phone (clipboard permission varies; falls back to showing
      the text to copy).
- [ ] Print handout on a real printer (checked as an on-screen preview only).
- [ ] The chime, audibly, at a phase change.

## Known limits, worst first

1. **The labels are judgement calls** made from a title and the first lines of
   text. Some will be wrong. That's what **fix this** is for; export and fold them
   in every so often.
2. **Date-night papers are thin in Physics (14), Chemistry (16) and Art (13).**
   The journals are specialist in those areas. Candidates: *Physics Today*-style
   review venues aren't open access; arXiv's physics.pop-ph and physics.hist-ph
   lists might work, via OpenAlex's arXiv source.
3. **The humanities pull leans on linguistics** (language teaching and
   bilingualism journals rank high on citations). More history, philosophy and art
   history would need targeted journal lists rather than the field filter.
4. **The log and fixes are per-device.** Export/import moves them. A live shared
   log would need a database behind the page (e.g. Supabase), which GitHub Pages
   alone doesn't provide.
5. **No Claude-backed "Reading notes"** on GitHub Pages. The handout falls back to
   the fixed talk questions in `prompts.js`. Bringing it back would mean calling
   an LLM API from the page, which needs a key and so a small backend.

## Backlog, roughly in order of value

- **Fold in fixes regularly.** Nothing prompts you to; consider a note in the app
  when you have, say, 20 unexported fixes.
- **Targeted humanities sources** (limit 3 above): a hand-picked journal list in
  `extend.mjs`, same shape as `JOURNALS` in `papers3.py`.
- **Reading time for papers with no page count** (about 60% have none; eLife and
  PLOS use article numbers). OpenAlex doesn't expose word counts; the free route is
  fetching the PDF's page count once and caching it.
- **Let "not in the mood" learn too**, e.g. by nudging the familiarity dial away
  from areas you keep skipping.

## Deliberate non-goals

Worth writing down so they don't get re-litigated:

- **No PDF annotator.** Reading and annotating happen on paper. Building one is
  a product in itself.
- **No slide editor.** The five-minute limit means the talk is a handful of
  cards, not a deck.
- **No for/against assignment in Paper mode.** It's a paper you both learn
  something from, not a debate with sides. (The "Referee" lens is a role-play
  you swap halfway, not a side you're stuck with.)
