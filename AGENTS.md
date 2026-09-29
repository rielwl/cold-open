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
  `tools/lib.mjs`, `keyOf()` in `index.html`: keep the two identical; the
  tools test checks it).
  Papers: approachability `a` 0-3 (drives Date night), domain code, empirical
  flag `e`. Subjects: talkability `k` 0-3 (drives Talkable), domain code.
  Anything without a row gets 1 and keeps its original domain.
- Corrections made in the app are exported as JSON ("export fixes") and folded
  in with `node tools/enrich.mjs <file>.json`. That's the supported way to change
  a rating; editing the .tsv by hand also works (one row per key; enrich warns
  about duplicates, and the later row wins).
- `tools/lib.mjs` holds what `enrich.mjs` and `extend.mjs` share (corpus
  read/write, the fetch helper, OpenAlex auth, `key()`). The Python scripts are
  the original pipeline and are left as they were.

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
- The visual design is "Airmail", specified in `docs/airmail-design.md` (tokens,
  type scale, spacing, component states, motion). Follow it for any UI change;
  it's high fidelity. Styling hangs off attributes: `aria-pressed`,
  `aria-selected`, `aria-expanded`, `data-mode`, and the clock's
  `data-paused` / `data-final`.
- Colours are tokens on `:root`, redefined for dark mode. New colours go in all
  three token blocks. Print shows only `.handout` (a separate element at the end
  of `body`), black on white in every theme; keep the print block last.
- The page must work at phone width (390px) with no sideways scroll, and with
  the clock bar on one row.
- `index.html` is a complete document (doctype, charset, viewport). Keep it that
  way; a static host serves it as-is.
- Never commit API keys or personal emails. The tools read `OPENALEX_API_KEY`
  and `CONTACT_EMAIL` from the environment; the repo is public.
- No network calls at runtime. The deck ships with the page.
- Reading and annotation happen on paper. See the non-goals in NEXT-STEPS.md
  before adding a PDF viewer, slide editor, or debate mode.

## Checking a change

`node --test tools/lib.test.mjs` covers the tools' shared helpers and checks
that `keyOf()` still matches `key()`. The app itself has no automated tests.
Serve the folder (`npx serve .` or
`python -m http.server`), then in a browser: deal in both modes, start and stop
the clock, re-deal mid-clock, pass with a reason, correct a rating with "fix
this" (it should survive a reload), and preview the print handout
(Paper mode, Print handout; or set `document.documentElement.dataset.preview =
"handout"` to see it on screen). Check dark mode and a 390px-wide window.

## Deploying

Push to `main`. `.github/workflows/pages.yml` deploys `index.html`, `corpus.js`
and `prompts.js` to GitHub Pages at https://rielwl.github.io/cold-open/. No
agent or CLI step is needed. If you add a file the page loads, add it to the
workflow's copy step too.
