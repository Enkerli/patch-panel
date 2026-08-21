# CLAUDE.md

Patch Panel is a curated, evidence-tagged reference of software modular systems for sound
and image. Live at <https://enkerli.github.io/patch-panel/>. No build step, no dependencies —
`index.html` + `app.js` read everything from `data/`.

Read `README.md`, `CONTRIBUTING.md`, `data/schema.json` and `data/vocabulary.json` before
touching anything. This file records the conventions that aren't obvious from those, so a cold
session doesn't reinvent them.

## Current state

Run `node tools/validate.mjs` first, every session, to see where things stand. As of v0.5.0:
46 specimens, 197 evidence rows (164 claims + 33 niceties), 61 of them unverified (31%),
12 warnings. Topology split: graph 28 · rack 7 · matrix 2 · code 5 · format 4.

Every remaining warning is `every claim rests on recollection`; the licence column was cleared
on 2026-08-21.

Note for sessions run on Claude Code on the web: the environment's network policy blocks nearly
every vendor domain (kilohearts.com, cherryaudio.com, audulus.com, tracktion.com,
reasonstudios.com, warmplace.ru, softube.com …) along with Wikipedia, the app stores and the
synth press. Reachable: github.com, raw.githubusercontent.com, gitlab.com, developer.apple.com.
The twelve remaining warnings are all specimens whose only primary source sits behind that
block — they need a session with wider egress, not more effort.

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

## Landing changes

**Small changes go straight to `main`** — the owner asked for this on 2026-08-21, so no
branch and no pull request. CI runs on pushes to `main` as well as on pull requests, so a
direct push is still checked; run both tools locally first regardless.

Small means: self-contained, both checks green, and it doesn't change what the cabinet
*claims*. Typos, style, tooling, a single sourced correction, an accessibility or rendering
fix — push them.

Open a pull request for anything else: adding or removing a specimen (the render-test counts
change too), vocabulary or schema terms, a topology, a bulk pass over the evidence tags, or
anything where the diff is easier to judge whole than as a commit message. When in doubt,
a pull request costs one round trip; an unwanted commit on `main` costs a revert.

## Before every commit

```sh
node tools/validate.mjs     # exits non-zero on errors
node tools/render-test.mjs  # renders app.js headlessly against the real data
```

**Warnings are the backlog and are expected. Errors are not.** Don't "fix" a warning by
weakening a claim or deleting a licence row — the warnings name the open jobs.

`tools/render-test.mjs` hard-codes the expected specimen count (`46`, twice — once directly and
once as `46 * 4` for the facet badges). Adding or removing a specimen means updating both.

## Style

- **British spelling** (licence, catalogue, behaviour), sentence case in prose.
- Claim `label` fields: **24 characters max**, and they read as column headings, not sentences.
- Descriptive, not promotional. This is a catalogue, not a buyer's guide; "revolutionary"
  belongs to marketing copy.

## Licence split

`data/` is CC0; `index.html`, `app.js` and `tools/` are MIT. Keep new files on the right side
of that line.
