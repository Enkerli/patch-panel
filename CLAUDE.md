# CLAUDE.md

Patch Panel is a curated, evidence-tagged reference of software modular systems for sound
and image. Live at <https://enkerli.github.io/patch-panel/>. No build step, no dependencies —
`index.html` + `app.js` read everything from `data/`.

Read `README.md`, `CONTRIBUTING.md`, `data/schema.json` and `data/vocabulary.json` before
touching anything. This file records the conventions that aren't obvious from those, so a cold
session doesn't reinvent them.

## Current state

Run `node tools/validate.mjs` first, every session, to see where things stand. As of v0.5.0:
43 specimens, 176 evidence rows (143 claims + 33 niceties), 59 of them unverified (34%),
15 warnings. Topology split: graph 27 · rack 7 · matrix 2 · code 4 · format 3.

Every remaining warning is `every claim rests on recollection`; the licence column was cleared
on 2026-08-21.

## Evidence discipline

This is the rule the project exists to keep. The validator enforces it as an *error*, not a
warning.

- `verified` — checked against a vendor page, official docs, or another primary source.
  **Source URL required.**
- `reported` — press, a maintainer's blog, a forum thread by someone who'd know.
  **Source URL required.**
- `unverified` — asserted from memory. **Must NOT carry a source URL.**

**Never invent or guess a URL.** If you can't find a real source, leave the claim `unverified`.
A plausible-looking dead link is worse than an honest `unverified` tag, because it looks done.

Prefer primary sources, in this order: vendor docs > news article > maintainer forum post >
user forum post. Paraphrase in our own words with a link to the original; never quote at length.

Source URLs must be `https://`. The schema pattern allows `http`, but the CI workflow
(`.github/workflows/validate.yml`) rejects anything that isn't `https`.

## Corrections are the point

If checking a claim shows it was wrong, **fix the text in the same change and say so in the
commit message**. Nobody has to pretend the original was close. The README keeps a public
record of past errors; that's deliberate, not embarrassment to be tidied away.

## Editing data/systems.json

**Edit the file IN PLACE. Never regenerate it wholesale.** An earlier rewrite silently dropped
ten specimens. Use targeted edits against the existing JSON; don't parse-and-reserialise the
whole document.

`id` is **permanent once published** — other documents anchor to it. Rename the `name` field if
a product is rebranded, never the `id`.

`version` and `updated` at the top of the file are rendered into the page's stats line.

## Vocabulary and schema move together

New topology / facet / nicety-theme terms go in `data/vocabulary.json` **and** the matching enum
in `data/schema.json`. The validator fails if the two disagree — deliberately, so a term has to
be defined before it can be used.

**Ask before adding a topology.** Five is already an argument, and a sixth should be too.

Nothing about a specimen is hard-coded in `app.js`. If a label reads wrong, the fix is in
`data/vocabulary.json`.

## Inclusion test for a new specimen

**What does this show that nothing else in the cabinet shows?** If the answer is "it's another
one of those", it belongs in the deliberately-not-exhaustive note, not as an entry. Coverage is
not the goal; the differences showing is.

Same test applies to `summary`: if the sentence could be said of three other entries, it isn't
specific yet.

`facets` summarise the claims beneath them. Don't mark `export: "yes"` unless a claim below says
what it exports.

## Before every commit

```sh
node tools/validate.mjs     # exits non-zero on errors
node tools/render-test.mjs  # renders app.js headlessly against the real data
```

**Warnings are the backlog and are expected. Errors are not.** Don't "fix" a warning by
weakening a claim or deleting a licence row — the warnings name the open jobs.

`tools/render-test.mjs` hard-codes the expected specimen count (`43`, twice — once directly and
once as `43 * 4` for the facet badges). Adding or removing a specimen means updating both.

## Style

- **British spelling** (licence, catalogue, behaviour), sentence case in prose.
- Claim `label` fields: **24 characters max**, and they read as column headings, not sentences.
- Descriptive, not promotional. This is a catalogue, not a buyer's guide; "revolutionary"
  belongs to marketing copy.

## Licence split

`data/` is CC0; `index.html`, `app.js` and `tools/` are MIT. Keep new files on the right side
of that line.
