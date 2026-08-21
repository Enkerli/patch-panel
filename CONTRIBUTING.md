# Contributing

The most valuable contribution here is small: **find a claim tagged `unverified`, check it,
and add the source URL.** You don't need to write code, and you don't need to add a specimen.

## Promoting a claim

Open `data/systems.json`, find the entry, and change this:

```json
{
  "label": "Licence",
  "text": "GPLv3.",
  "evidence": "unverified"
}
```

into this:

```json
{
  "label": "Licence",
  "text": "GPLv3, with the module ecosystem under mixed terms.",
  "evidence": "verified",
  "source": "https://example.org/licence"
}
```

Then run `node tools/validate.mjs` and open a pull request. That's the whole workflow.

If checking the claim shows it was **wrong**, correct the text in the same PR and say so in the
description. Corrections are the point; nobody has to pretend the original was close.

## The evidence tags

| Tag | Means | Source URL |
|---|---|---|
| `verified` | Checked against a vendor page, official docs, or another primary source | Required |
| `reported` | Press coverage, a maintainer's blog, a forum thread by someone who'd know | Required |
| `unverified` | Asserted from memory or general knowledge, not checked | **Must be absent** |

The validator enforces all three rules. An `unverified` claim carrying a URL is an error — if
you have a source, the claim is `verified` or `reported`.

Prefer primary sources. A vendor's own documentation beats a news article about it; a news
article beats a forum post; a forum post from a maintainer beats a forum post from a user.
Where a limitation is only visible in practice, a forum thread tagged `reported` is the honest
record — see the MODEP MIDI entry.

Paraphrase rather than quote. The text should be your own words with a link to the original.

## Adding a specimen

Before adding, ask: **what does this show that nothing else in the cabinet shows?** If the
answer is "it's another one of those", it belongs in the "deliberately not exhaustive" note
rather than as an entry. Representative examples beat coverage — the list stops being useful
the moment it tries to include every virtual Eurorack.

A new entry needs: `id` (lowercase slug, stable forever — other documents anchor to it), `name`,
`developer`, `year`, `topology`, `domains`, `platforms`, `summary`, `facets`, `claims`,
`niceties`. See `data/schema.json` for the full contract.

Two things to get right:

- **`summary`** — if the sentence could be said of three other entries, it isn't specific yet.
- **`facets`** — these summarise the claims. Don't mark `export: "yes"` unless a claim below
  says what it exports.

## Adding a vocabulary term

New topologies, facets and nicety themes go in `data/vocabulary.json` **and** the matching enum
in `data/schema.json`. The validator fails if the two disagree, which is deliberate: it means a
new term has to be defined before it can be used.

Raise an issue before adding a topology. Five is already an argument, and a sixth should be too.

## Known gaps

- **Visual systems** are thin. TouchDesigner, Video Painter and VS are in; vvvv, Notch, Cables,
  Houdini and Resolume Wire are not. They likely need their own facets — render graph, GPU
  domain, real-time vs offline — before they can share this table honestly.
- **Visual interchange** — Syphon, Spout, NDI, ISF — moves frames at runtime rather than patches
  at build time. That may be a separate axis, not more rows.
- **The iPad ecosystem** deserves more than a few entries: AUM, Loopy Pro, Audulus and Mozaic
  together form a modular system whose modules are whole applications.
- **Android** now has a platform term, but only Caustic 3 is an Android-first specimen; SunVox
  and libpd merely reach it. What's missing is the narrative entry: Android has no AUv3 or LV2
  equivalent, so modularity there means whole self-contained apps rather than a module contract.
- **Licences** are the weakest column overall. Several entries assert an open-source licence
  with no verified source, which the validator warns about on every run.

## Style

British spelling, sentence case in prose. Claim `label` fields are short (24 characters max) and
read as column headings, not sentences. Keep the tone descriptive rather than promotional — this
is a catalogue, not a buyer's guide, and "revolutionary" belongs to marketing copy.
