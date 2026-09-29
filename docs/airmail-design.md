# Handoff: Cold Open — "Airmail" redesign

## Overview
Cold Open (live: https://rielwl.github.io/cold-open/) is a single-page app that deals you something to be curious about, then runs a timer.
- **Sprint (solo):** deals a Wikipedia subject + five guiding questions (one per card of a 5-minute talk). Research against the clock, then present.
- **Paper (two of you):** deals an open-access paper + one "reading lens". Built for date night: both read on paper, then talk.

The app only picks and times; reading and notes happen on paper.

**Airmail** restyles every deal as an airmail letter: a red/blue diagonal-striped border, a postage stamp that carries the card type, a postmark, Source Serif body text on ruled writing lines. Calm and text-first, with enough ceremony for a date night.

## About the design files
- `index.html` is a **high-fidelity, working reference implementation**: one self-contained file, inline CSS, plain JS, no build step, Google Fonts only. The production app is also a single static `index.html` on GitHub Pages, so this file is intended to be **merged into the existing repo's `index.html`**, not rebuilt in a framework.
- **The task for Claude Code:** take the markup + CSS from `index.html` and merge it with the existing production script. The designer did **not** have the production JS, so the script in `index.html` is a **rebuild from the brief**. Where the production script's behavior differs (deck data, fetching, phases, rating logic), **keep the production behavior** and restyle it with this markup/CSS. All element ids/classes the production script depends on are preserved (see "Id / class contract").
- `reference/Airmail Handover.dc.html` is the visual spec: tokens with computed contrast, type scale, component states, and live screens (it iframes `reference/index.html` and drives it into each state). Open it in a browser served over http (e.g. `npx serve reference`); it needs `support.js` beside it.

## Fidelity
**High fidelity.** Colors, type, spacing, states and motion are final. Match them exactly.

## Design tokens
All on `:root`. Dark applies under `@media (prefers-color-scheme: dark)` unless `html[data-theme="light"]`; `html[data-theme="dark"]` forces dark. Print styles come last and force black on white.

| Token | Role | Light | Dark |
|---|---|---|---|
| --surface | page ground | #e9e6df | #121826 |
| --card | letter sheet, timer bar, control fills | #f7f4ec | #1b2233 |
| --ink | primary text, control borders | #23241f | #e9e5dc |
| --ink-soft | meta, address line, quiet buttons | #595a53 | #a8aebb |
| --accent | primary action, links, timer digits, progress | #2d4a7a | #8fb0e6 |
| --accent-hover | hover for accent | #243d66 | #a9c3ee |
| --on-accent | text on accent | #f7f4ec | #0b0f19 |
| --highlight | numerals, "fix this", phase, last 60s, lens label | #a93826 | #e08877 |
| --rules | dividers, dashed meta rules, empty-card border | #cfcac0 | #333c52 |
| --lines | ruled writing lines, log hairlines | #dde2e8 | #2a3246 |
| --focus | focus ring | #2d4a7a | #e9e5dc |
| --stamp-sprint | Sprint stamp fill | #2d4a7a | #8fb0e6 |
| --stamp-paper | Paper stamp fill | #b8412f | #e08877 |
| --on-stamp | stamp text | #f7f4ec | #0b0f19 |
| --postmark | postmark ring + text | #6d6d67 | #8f96a5 |
| --stripe-a / --stripe-b | airmail stripe (decor) | #b8412f / #2d4a7a | #c85a48 / #6f8fc4 |
| --hover | hover tint | rgba(35,36,31,.06) | rgba(233,229,220,.07) |
| --shadow-card | letter shadow | 0 20px 36px -22px rgba(30,30,30,.5) | 0 20px 36px -22px rgba(0,0,0,.8) |

All text/background pairs pass WCAG AA (≥4.5:1) in both themes. The focus ring is ≥3:1. The handover doc computes and lists every pair.

**Spacing:** --s1 4 · --s2 8 · --s3 12 · --s4 16 · --s5 24 · --s6 32 · --s7 48 · --s8 64. Content max width 1080, gutter 32 (16 at ≤640). Ruled rhythm `--line` 32px (28 at ≤640).
**Radii:** 0 everywhere, except chips (999px) and the postmark (50%).
**Borders:** controls 1px solid --ink; dividers 1px --rules; meta row dashed 1px --rules; stamp perforation 3px dotted --card (2px on phone).
**Breakpoints:** >760 two-column card body; ≤760 one column + full-width DEAL; ≤640 phone (postmark hidden, small stamp, actions stretch); ≤420 compact timer bar.

## Typography
Google Fonts: **Source Serif 4** (400, 600, 400 italic) and **IBM Plex Mono** (400, 500). Fallbacks: Georgia / ui-monospace.
The → value is the phone size (≤640).

| Role | Spec |
|---|---|
| Wordmark | Serif 600 26/1.1, −0.01em → 20 |
| Tagline | Mono 400 12/1.4, hidden ≤640 |
| Tab / toggle | Mono 400 13/1 → 12 |
| Label | Mono 500 10.5/1, 0.14em, uppercase, --ink-soft |
| Address line | Serif italic 17/1.5 → 13, --ink-soft |
| Card title | Serif 600 clamp(30px, 4.2vw, 48px)/1.06, −0.015em, text-wrap: balance |
| Blurb | Serif italic 21/1.4 → 16 |
| Meta / rating | Mono 400 12/1.5, --ink-soft |
| Extract / abstract | Serif 400 16.5/1.65 → 15 |
| Question list | Serif 16.5 on the 32px ruled line; numeral Mono 13 --highlight → 15 on 28 |
| Lens | Serif italic 24/32 → 19/28 |
| Stamp | numeral Serif 600 34 (→20); label Mono 500 10/1.3, 0.1em, uppercase (→7) |
| Button | Mono 500 13/1; DEAL Mono 500 15, 0.24em |
| Timer | phase Mono 500 12, 0.1em, --highlight; digits Mono 500 28 tabular-nums, --accent (→26 at ≤420) |
| Log row | title Serif 15/1.4; date/mode/status Mono 12 |
| Footer | Mono 12/1.6, --ink-soft |

## Screens / views
Single page, top to bottom:
1. **Header**: wordmark + tagline on the left; mode tabs (a 1px ink box split into two 42px cells) on the right.
2. **Settings strip**: sits between top and bottom 1px --rules; flex-wrap, gap 16/32.
   - Sprint shows Familiarity (Far from what I know / Anywhere / Close to home).
   - Both modes show Clock (presets 15/20/25/30 + number input + "min").
   - Paper shows Papers (Date night — anyone can follow / Anything) and Talk clock (15/30/45 + input).
   - DEAL is right-aligned (full width ≤760).
   - The "What I already know" disclosure sits full width below.
3. **Card** (`#card`):
   - Frame: 9px padding showing the stripe `repeating-linear-gradient(-45deg, stripe-a 0 16px, card 16px 24px, stripe-b 24px 40px, card 40px 48px)`. At ≤640 the padding is 7px and the stops are 11/16/27/32.
   - Sheet: padding 36/52/40, flex column, gap 16.
   - Head: grid `minmax(0,1fr) auto`.
     - Left column: address line ("By air, to the curious —" / "By air, for two —", then area · tag), title, blurb (Sprint only).
     - Right column: franking, i.e. the postmark (104px circle, rotated −12°, "COLD OPEN / date / serial") beside the stamp (92×112).
     - **The franking must never overlap text**, which is why it has its own grid column.
   - Meta row: source/size or journal · year · pages · cited, then the rating + "fix this" link.
   - Body `.cols`:
     - Sprint: 1fr / 1.2fr, with the extract + "Open the article ↗" on the left and "One for each card of your talk" + 5 questions on the right.
     - Paper: 1.2fr / 1fr, with the abstract + "Open the PDF ↗" · "Article page ↗" on the left and "Read it for this" + the lens on the right.
   - Actions: primary, then secondaries, then a flexible spacer, then quiet buttons.
     - Sprint: Start the clock · Deal another · Pass — not this one · Log it as done.
     - Paper: Start the clock · Deal another · Pass · Log it as done · Copy invite · Print handout.
   - Empty state: a dashed 2px --rules box, min-height 320, reading "Nothing in the post yet." / "Press Deal and a card arrives here."
4. **Log**: "The log" h2, #logcount, header links (export · export fixes · import · clear), rows.
5. **Footer.**
6. **Timer bar** (`#clockbar`): fixed to the bottom, --card background, 1px top rule, 3px progress bar on top.

## Components & states
Styling comes from attributes: toggles `aria-pressed`, tabs `aria-selected`, disclosures `aria-expanded`, clock `data-paused` / `data-final`. States shared by every control:
- Focus: 2px --focus outline, 2px offset, on `:focus-visible`.
- Disabled: opacity .45, cursor not-allowed.
- Hover: --hover tint (primary uses --accent-hover).
- Press: translateY(1px).

- **Mode tabs**: selected = ink fill with --card text. The unselected tab has tabindex −1. ←/→ switches mode. Switching mode clears a card from the other mode.
- **Segmented toggles** (`.seg`): 40px cells with ink hairline dividers; pressed = ink fill. #fam-far and #fam-close are disabled until at least one "known" chip is ticked.
- **Number + presets**: the presets and the input share one box. A preset is pressed only when it equals the current value. The input accepts 1–180; an invalid value reverts on change.
- **Known panel**: the #toggleknown "+" box becomes "–" when expanded. The summary reads "nothing ticked yet" or "N ticked: …". #knownpanel is a dashed --card box with pill chips; a pressed chip gets an ink fill and a "✓ " prefix. Unticking the last chip resets Familiarity to Anywhere.
- **Stamp**: shows "5" + "Five questions" for Sprint, or "2" + the lens stamp for Paper ("Would you fund it", "Effect size", "Weakest link", "Explain it back"). Paper uses the --stamp-paper fill. The numeral is aria-hidden.
- **Fix this** (`.fixer`, toggled by `.linkbtn[data-act=fix]` with aria-expanded): a dashed panel on the --surface background containing:
  - a 0–3 rating group, each value with a label:
    - Talkability: skip it · thin · a solid five minutes · could go long
    - Date night: not for tonight · heavy going · good with some effort · anyone can follow
  - an Area select;
  - Paper only: a "Reports its own data / Theory" toggle;
  - Save fix (primary) and Cancel (quiet).
  Saved fixes are stored per card id and override the card's data.
- **Pass** (`.reasons`): focus moves to the first chip.
  - Sprint chips: Already know it · Not interesting · Too thin · Wrong area.
  - Paper chips: Already read it · Not tonight · Too technical · Wrong area.
  - Plus "Just pass" and "Never mind". Any chip logs the card as passed with its reason and deals the next card.
- **Notice** (`.notice`, role=status): Mono 13 in a 1px ink box on --surface, with a "✉" prefix in --highlight. Hides after 5s. Copy:
  - "Logged as done."
  - "Passed and logged. Here's another."
  - "Fix saved on this device. Export fixes to send it upstream."
  - "Invite copied. Paste it into a message." (or "Couldn't copy. The link is …")
  - "Time. Log it as done, or deal another."
- **Buttons** `.act`, 44px tall:
  - `.primary`: accent fill.
  - default: 1px ink border, transparent.
  - `.quiet`: underlined --ink-soft text, ink on hover.
- **Links**: --accent with 3px underline offset. External links open in a new tab and end in "↗".
- **Timer bar**: must fit one row at 390px.
  - Running: "Pause". Paused: digits at 55% opacity, "Resume".
  - Last 60s: digits and bar turn --highlight, and the phase label blinks at 1s steps (not while paused).
  - #c-skip is primary and reads "Next phase", or "Finish" on the last phase. #c-stop is quiet.
- **Log rows**: grid 64 / 64 / 1fr / auto (on phone the mode column is dropped: 52 / 1fr / auto).
  - Done: status in --accent.
  - Passed: title in --ink-soft, struck through in the --rules colour, status "passed · reason".
  - Header links are disabled when there's nothing to act on.

## Interactions & behavior
- **Deal**: picks from the current mode's pool, excluding the current card.
  - Familiarity Far/Close filters by the known areas (falls back to the whole pool if the filter leaves nothing).
  - Date night keeps papers rated ≥2.
  - A random lens is picked for Paper.
- **Clock**: Start the clock opens the timer bar.
  - Phases: Sprint READ (Clock minutes) → TALK 5:00; Paper READ (Clock) → TALK (Talk clock).
  - Time is computed from a wall-clock end time, so it survives background tabs.
  - The tab title shows `mm:ss phase · Cold Open`.
  - Space toggles pause.
  - After the last phase, the bar closes and the "Time." notice shows.
- **Log it as done / Pass** add rows to localStorage `coldopen.log`: `{t, mode, id, title, status: "done"|"passed", reason}`.
- **Export** downloads JSON. **Import** merges by t+id with no duplicates. **Clear** asks for confirmation. **Export fixes** downloads `coldopen.fixes`.
- **Copy invite** puts this text on the clipboard: `Paper date? "Title" (Journal, Year) — URL\nRead it for this: lens`. Needs HTTPS.
- **Print handout** calls `window.print()`. Only `.handout` prints. It's black on white in every theme, with `@page { margin: 14mm }` and no size set, so it fits A4 and Letter. Contents:
  - masthead with a 3pt double rule;
  - stamp box;
  - title (Serif 600 22pt);
  - meta (Mono 8.5pt);
  - lens in a 1pt box (Serif italic 14pt);
  - abstract;
  - the article URL and PDF URL written out;
  - "Afterwards, talk about" (4 prompts);
  - 10 note lines at an 8.5mm pitch, drawn as borders (not backgrounds, which browsers drop when printing).
- **Motion**:
  - Deal: `.card-frame` goes from opacity 0, translateY(28px), rotate(−1.2deg) to rest over 420ms `cubic-bezier(.2,.7,.2,1)`.
  - Postmark: goes from scale 1.35 to 1 over 260ms, delayed 320ms.
  - Hover/press: 140ms.
  - `prefers-reduced-motion`: the deal is a 120ms opacity fade only, there's no postmark animation and no blink, and transitions are 0ms.
- **Responsive at 390px**: 16px gutters, no sideways scroll, tap targets ≥40px (card buttons 44), timer on one row.

## State
`S = {mode, fam, mins, easy, talk, known[]}` → localStorage `coldopen.settings`. Also `LOG[]` → `coldopen.log` and `FIX{id: {rating, area, kind}}` → `coldopen.fixes`. Runtime: `cur` (current card), `lensKey`, `T` (timer: phases, index, remaining, running, end).

## Id / class contract (all kept, no renames)
`#deal #card #clockbar #digits #phase #c-go #c-skip #c-stop #tab-sprint #tab-paper #fam-far #fam-any #fam-close #mins .mpreset #easy-on #easy-off #talkmins .tpreset #toggleknown #knownpanel #chips #logbody #logcount #exportlog #exportfixes #importlog #clearlog #foot .paperonly .stamp .title .meta .rating .extract .angle .qs .acts .act .reasons .fixer .handout .notice .logrow`

**Added:** `.sprintonly`, `#knownsum`, `#importfile` (hidden input behind #importlog), `#logempty`, and the layout classes `.card-frame .card-sheet .card-head .franking .postmark .address .blurb .cols .lens .links`. Mode visibility is controlled by `body[data-mode="sprint"|"paper"]`.

`window.ColdOpen` (at the end of the script) contains test/review hooks used by the handover doc. They're safe to delete in production.

## Assets
No images or icons. The "↗", "✓" and "✉" glyphs are plain text. The stripe, stamp perforation and postmark are pure CSS.

## Data
The deck in `index.html` is a **sample**: 6 Wikipedia subjects and 3 papers, including the two briefed cards. **Replace it with the production deck.** The entry shape is documented at the top of the script. Verify the PDF URLs; they follow the publishers' usual patterns and haven't been checked.

## Verify after merging
- Keyboard pass in both themes; screen reader announces selected / pressed / expanded, and notices are read out.
- 390px: no horizontal scroll, timer on one row, stamp never overlaps the title.
- Clock pause/resume works across background tabs; last-60s treatment appears.
- Fix, pass and log round-trips survive a reload; export/import works.
- Print preview from dark mode on A4 and Letter gives one clean black-on-white sheet.
- Reduced motion is respected.

## Screenshots (`screenshots/`, desktop ~910px wide)
01 Sprint card · 02 Paper card · 03 Settings with "What I already know" open · 04 Fix this open · 05 Pass "Why?" open · 06 Timer running (READ 29:56) · 07 Last 60 seconds (TALK 00:47) · 08 Log with rows · 09 Dark · Paper · 10 Dark · Sprint + timer · 11 Print handout · 12 Empty state.

In the captures, question numerals (CSS counters) don't render, and the fixed timer bar can appear offset. The live file is correct. For the 390px phone states, open `reference/Airmail Handover.dc.html` (§3), which shows them live.

## Files
- `index.html`: reference implementation (merge target).
- `reference/Airmail Handover.dc.html` + `reference/support.js` + `reference/index.html`: visual spec with live state screens.
