# Where this was left off

Last updated: 27 September 2026, after the date-night pass (the first real use).

## State: working and in use

- **Live page:** https://claude.ai/code/artifact/b6bdc9cf-860b-44f4-a357-964ee43bf47f
- **Repo:** https://github.com/rielwl/cold-open (private, no Pages)
- **Deck:** 4,360 subjects, 3,230 papers, 20 angles, 12 reading lenses

## What changed in the date-night pass

Found by actually using Paper mode to plan a date:

- **Fixed:** the clock bar showed on page load and never hid on Stop
  (`display:flex` beat the `hidden` attribute). After Stop, Resume did nothing.
- **Fixed:** "Deal another" left the old paper's timer running. Space now pauses
  mid-session instead of re-dealing and killing the clock.
- **Fixed:** the chime relied on an audio context created outside a click; it's
  now unlocked by "Start the clock".
- **Fixed:** the clock bar wrapped to two rows on a phone.
- **Date night filter.** Most of the deck is specialist work ("time-bin
  qudits"). Every paper now has an approachability label (0-3) and Date night,
  on by default, deals only 2s and 3s.
- **Domains corrected.** OpenAlex's topic model misfiles plenty (snow sports and
  wildlife under Medicine, the 1918 flu under Maths). The same labelling pass
  assigned each paper its real area.
- **Lenses match the paper.** "Find the effect size" and "A sample of what" are
  only dealt for papers that report their own data.
- **Page counts and PDF links** on the card, from OpenAlex, where available
  (about 900 and 1,600 papers respectively; eLife and PLOS use article numbers,
  so no page count). BibTeX-file links (eLife `.bib`) are replaced with the DOI.
- **Abstracts end on a full sentence** instead of mid-word.
- **Copy invite** and **Print handout** for Paper mode. The handout prints
  black-on-white even when the device is in dark mode.
- **Talk it over** is adjustable (15/30/45 or any number), default 30.
- **Pass asks why** (already know it / looks thin / too close to work / not in
  the mood). Three "already know it" passes in an area tick it as known, so the
  familiarity dial learns.
- **Cooldown instead of permanent exclusion.** Done is still forever; passed
  cards come back after 180 days ("not in the mood": 14 days).
- **Log export and import** (JSON), so it isn't trapped in one browser and two
  devices can be merged by hand.
- **More prompts.** Four new angles, four new lenses. They moved out of the
  5 MB deck into `prompts.js`, so adding more no longer needs a rebuild.
- **AGENTS.md** added with the house rules; `CLAUDE.md` points at it.

## Picking it back up

1. **To change the live page from a new Claude Code session**, pass the artifact
   URL above explicitly. Publishing without it creates a second artifact.
2. **Rebuild order** is in the README; the last step is now `node tools/enrich.mjs`,
   which writes `corpus.js` straight to the repo root (no more copying it up).
3. **OpenAlex has a daily budget now.** Keyless use gets about 1,000 cheap calls a
   day; one title search can cost ten. `enrich.mjs` uses DOI batches and a cache,
   so a full re-enrich is about 70 calls. `papers3.py` still does source searches
   and cursor paging and may need an API key for a full rebuild.
4. **Python isn't installed on the Windows machine** this was last worked on;
   the enrichment step is Node for that reason.

## Not yet verified

- [ ] **Sharpen it / Reading notes** inside the Claude viewer (needs the artifact).
      When it answers, the handout uses its "watch for" and "talk about" points.
- [ ] Copy invite inside the artifact iframe. If the clipboard is blocked there it
      falls back to showing the text to copy by hand; that fallback was seen working.
- [ ] Print handout on a real printer (checked as an on-screen preview only).
- [ ] The chime, audibly, at a phase change.

## Known limits, worst first

1. **Date night is only as good as the labels.** They were made from each paper's
   title and first lines of abstract. Expect some misjudged ones; fix a row in
   `tools/paper_ratings.tsv` and re-run `node tools/enrich.mjs`.
2. **New papers need labelling.** Anything a rebuild adds has no ratings row and
   defaults to approachability 1, so it never appears on Date night until labelled.
3. **Thin topic domains.** Chemistry has 108 subjects, Mind & behaviour 111,
   Maths 138, Medicine 152, against a 520 cap elsewhere.
   *Fix:* `tools/topup.py` requires 12,000 bytes and doesn't cache. Lower the
   floor to ~9,000, add seed categories, save the hydration dict.
4. **Paper mode is science-heavy.** Very few Language & culture papers.
   *Fix:* add humanities and social-science sources (DOAJ, arXiv econ,
   *Philosophers' Imprint*), and label them.
5. **Some Sprint subjects are misfiled too** (the 17th-century state of Jaxa shows
   as Earth & climate, inherited from the unusual-articles "Places" subpage).
   Not relabelled yet; the same labelling approach would work.
6. **The log is per-device.** Export and import help. A live shared log needs the
   artifact `db` capability (org-internal, may stop a partner opening the link)
   or a real host with a database.

## Backlog, roughly in order of value

- **Label the Sprint topics** the way the papers were: real domain plus an "is
  there five minutes of talk in this?" score, to replace the byte-length depth floor.
- **Tune the oddity depth floor** (10,000 bytes in `tools/build5.py`) after a few
  weeks of use, or retire it in favour of the label above.
- **Use the pass reasons further.** "Looks thin" passes could lower that paper's
  approachability, or feed back into the ratings file.
- **Estimate reading time** for papers with no page count (word count of the full
  text isn't available offline; OpenAlex's `fulltext` could supply it).

## Deliberate non-goals

Worth writing down so they don't get re-litigated:

- **No PDF annotator.** Reading and annotating happen on paper. Building one is
  a product in itself.
- **No slide editor.** The five-minute limit means the talk is a handful of
  cards, not a deck.
- **No for/against assignment in Paper mode.** It's a paper you both learn
  something from, not a debate with sides. (The "Referee" lens is a role-play
  you swap halfway, not a side you're stuck with.)
