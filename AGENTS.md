# Working on Cold Open

Instructions for any coding agent (Codex, Claude Code, others) and for humans.
Read `README.md` for what the app is and `NEXT-STEPS.md` for where it stands.

## Shape of the code

- `index.html` is the whole app: one page, inline CSS and JS, no build step and
  no dependencies. Keep it that way; don't introduce a bundler or framework.
- `corpus.js` is the deck (~5 MB, `window.SEEDS`). It is generated, never
  hand-edited. Regenerate it with the pipeline in `tools/` (see README).
- `prompts.js` holds the Sprint angles and Paper reading lenses as plain data.
  Edit it directly; no rebuild needed. A lens with `needs:"data"` is only dealt
  for papers that report their own measurements (`e:1` in the deck).
- `tools/paper_ratings.tsv` is hand-reviewed data, committed on purpose:
  approachability (`a`, 0-3, drives "Date night"), corrected domain, and the
  empirical flag, keyed by normalised title. New papers without a row get
  `a=1, e=1` and their OpenAlex domain.

## House rules

- The JS is deliberately plain ES5-style (`var`, `function`, no modules) and
  matches the existing idiom: `$()` for `getElementById`, `esc()` on every
  string that reaches `innerHTML`, `try/catch` around every `localStorage` call.
- Colours are tokens on `:root`, redefined for dark mode. New colours go in all
  three token blocks, and the `@media print` block must keep outranking them.
- The page must work at phone width (390px) with no sideways scroll, and with
  the clock bar on one row.
- `window.claude` (the "Sharpen it / Reading notes" button and the optional
  shared log) only exists inside the Claude artifact viewer. Everything else
  must work without it; feature-detect and degrade silently.
- No network calls at runtime. The deck ships with the page.
- Reading and annotation happen on paper. See the non-goals in NEXT-STEPS.md
  before adding a PDF viewer, slide editor, or debate mode.

## Checking a change

There are no automated tests. Serve the folder (`npx serve .` or
`python -m http.server`), then in a browser: deal in both modes, start and stop
the clock, re-deal mid-clock, pass with a reason, and preview the print handout
(Paper mode, Print handout). Check dark mode and a 390px-wide window.

## Deploying

The live copy is a Claude artifact (URL in README). Pushing to `main` does not
update it; it has to be republished from a Claude session with that URL passed
explicitly. The page is static, so any static host also works if the repo is
ever made public, minus the Claude-only button.
