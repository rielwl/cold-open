# Where this was left off

Last updated: 14 September 2026, end of the first build session.

## State: working and in use

The app is built, published and usable. Nothing is half-finished or broken.

- **Live page:** https://claude.ai/code/artifact/b6bdc9cf-860b-44f4-a357-964ee43bf47f
- **Repo:** https://github.com/rielwl/cold-open (private, no Pages)
- **Deck:** 4,360 subjects, 3,230 papers, 16 angles, 8 reading lenses

Both modes work: Sprint deals a subject plus a required angle, Paper deals an
open-access paper plus a reading lens. The clock, the familiarity dial, the
"what I already know" panel and the session log all work and persist to
`localStorage`. Reading and note-taking happen on paper, by design.

## Picking it back up

Everything needed to rebuild the deck is in `tools/`, documented in the README.
Two things that are easy to forget:

1. **To change the live page from a new Claude Code session**, the artifact URL
   above has to be passed explicitly. Publishing without it creates a *second*
   artifact at a new link instead of updating this one.
2. **`corpus.js` lives at the repo root**, but `tools/build5.py` writes it into
   `tools/`. Copy it up after rebuilding.

## Not yet verified

The page was written and published but never opened in a browser during the
build session. Worth confirming on first real use:

- [ ] The riso offset-shadow card animation looks right, not jittery
- [ ] The clock bar doesn't cover content on a phone
- [ ] The chime actually fires at phase changes (browsers block audio until the
      page has been clicked once — starting the clock should count, but check)
- [ ] **Sharpen it** returns something useful, and degrades quietly if declined
- [ ] Dark mode reads correctly — it was written token-first but never seen

## Known limits, worst first

1. **Thin topic domains.** Chemistry has 108 subjects, Mind & behaviour 111,
   Maths 138, Medicine 152 — against a 520 cap elsewhere. "Close to home" in
   those areas will repeat sooner. The cause is that Wikipedia's featured-article
   list barely covers them.
   *Fix:* `tools/topup.py` currently requires 12,000 bytes and doesn't cache what
   it fetches. Lower the floor to ~9,000, add more seed categories, and save the
   hydration dict so re-filtering doesn't mean re-scraping.

2. **Paper mode is science-heavy.** Only 37 Language & culture papers, because
   the good open-access journals are scientific.
   *Fix:* add humanities and social-science open-access sources — DOAJ, arXiv
   econ, *Philosophers' Imprint*.

3. **The log is per-device.** Two people on two machines don't share it, so the
   same subject can come up for each of you.
   *Fix, two options:* declare the artifact's `db` capability (about one line,
   but it makes the artifact organisation-internal, which may stop a partner
   opening the link at all); or move to a real host with Supabase, which also
   means losing the Claude-backed button. Only worth doing if the duplication
   actually becomes annoying.

4. **"Sharpen it" only exists inside the Claude viewer.** It calls
   `window.claude`. Anywhere else — including GitHub Pages — the button doesn't
   render and everything else still works.

## Backlog, roughly in order of value

- **Record *why* a subject was passed.** The Pass button stores only that it
  happened. Capturing "too close to work" / "already know it" / "looks thin"
  would let the familiarity dial learn instead of being set by hand.
- **Tune the oddity depth floor.** Currently 10,000 bytes in `tools/build5.py`.
  It cut some good short entries (*Shm-reduplication*) to remove the one-joke
  ones (*Dick Assman*, *Cinnamon Roll Day*). Adjust after a few weeks of real use.
- **Write more angles.** 16 shapes and 8 lenses is enough to stay fresh for a
  while, but they'll start repeating. They're plain data at the bottom of
  `tools/config.py` and cost nothing to extend.
- **Export the log**, so a year of sessions isn't trapped in one browser.
- **Make the paper-mode "Talk it over" phase configurable.** It's hardcoded to
  15 minutes; only the reading clock is adjustable.
- **A cooldown rather than a permanent exclusion.** Right now anything logged
  never comes back. A "not for six months" rule might be better than "never".

## Deliberate non-goals

Worth writing down so they don't get re-litigated:

- **No PDF annotator.** Reading and annotating happen on paper. Building one is
  a product in itself.
- **No slide editor.** The five-minute limit means the talk is a handful of
  cards, not a deck.
- **No for/against assignment in Paper mode.** It's a paper you both learn
  something from, not a debate with sides.
