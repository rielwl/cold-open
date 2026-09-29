# Working on Cold Open

Instructions for any coding agent (Codex, Claude Code, others) and for humans.
Read `README.md` for what the app is and `NEXT-STEPS.md` for where it stands.

## Shape of the code

- `index.html` is the whole app: one page, inline CSS and JS, no build step and
  no dependencies. Keep it that way; don't introduce a bundler or framework.
- `corpus.js` is the deck (~5 MB, `window.SEEDS`). It is generated, never
  hand-edited. Regenerate it with the pipeline in `tools/` (see README).
- `prompts.js` holds the Sprint guiding questions (five groups; a card gets one
  from each, in order) and the Paper reading lenses, as plain data.
  Edit it directly; no rebuild needed. A lens with `needs:"data"` is only dealt
  for papers that report their own measurements (`e:1` in the deck).
- `tools/paper_ratings.tsv` and `tools/topic_ratings.tsv` are hand-reviewed
  data, committed on purpose, keyed by normalised title (`key()` in
  `tools/enrich.mjs`, `keyOf()` in `index.html`: keep the two identical).
  Papers: approachability `a` 0-3 (drives Date night), domain code, empirical
  flag `e`. Subjects: talkability `k` 0-3 (drives Talkable), domain code.
  Anything without a row gets 1 and keeps its original domain.
- Corrections made in the app are exported as JSON ("export fixes") and folded
  in with `node tools/enrich.mjs <file>.json`. That's the supported way to change
  a rating; editing the .tsv by hand also works.

## Labelling new cards

`tools/extend.mjs` and rebuilds add cards with no ratings row. To label them,
dump the unrated ones (title plus the first ~250 characters of text) and judge
each by hand against the scales in the headers of the .tsv files, rather than
with a keyword heuristic (heuristics were tried and rank "gene-set enrichment
analysis" as easy reading). Append rows, then re-run `node tools/enrich.mjs`.

## House rules

- The JS is deliberately plain ES5-style (`var`, `function`, no modules) and
  matches the existing idiom: `$()` for `getElementById`, `esc()` on every
  string that reaches `innerHTML`, `try/catch` around every `localStorage` call.
- Colours are tokens on `:root`, redefined for dark mode. New colours go in all
  three token blocks, and the `@media print` block must keep outranking them.
- The page must work at phone width (390px) with no sideways scroll, and with
  the clock bar on one row.
- `window.claude` (the "Sharpen it / Reading notes" button, the optional shared
  log, viewer downloads) only exists inside the Claude artifact viewer, which is
  no longer where the app lives. That code is dormant on GitHub Pages. Everything
  must work without it; feature-detect and degrade silently.
- `index.html` is a complete document (doctype, charset, viewport). Keep it that
  way; a static host serves it as-is.
- Never commit API keys or personal emails. The tools read `OPENALEX_API_KEY`
  and `CONTACT_EMAIL` from the environment; the repo is public.
- No network calls at runtime. The deck ships with the page.
- Reading and annotation happen on paper. See the non-goals in NEXT-STEPS.md
  before adding a PDF viewer, slide editor, or debate mode.

## Checking a change

There are no automated tests. Serve the folder (`npx serve .` or
`python -m http.server`), then in a browser: deal in both modes, start and stop
the clock, re-deal mid-clock, pass with a reason, correct a rating with "fix
this" (it should survive a reload), and preview the print handout
(Paper mode, Print handout). Check dark mode and a 390px-wide window.

## Deploying

Push to `main`. `.github/workflows/pages.yml` deploys `index.html`, `corpus.js`
and `prompts.js` to GitHub Pages at https://rielwl.github.io/cold-open/. No
agent or CLI step is needed. If you add a file the page loads, add it to the
workflow's copy step too.
