# Patch Panel

A cabinet of software modular systems for sound and image — 47 specimens, arranged so
the differences show rather than to be exhaustive.

**[Browse it →](https://enkerli.github.io/patch-panel/)**

Most lists of this kind are link dumps that go stale invisibly. This one differs in three ways:

1. **Every claim carries its evidence status.** `verified` (checked against a vendor or primary
   source), `reported` (press or forum), or `unverified` (asserted from memory). Unverified
   entries aren't hidden — they're the contribution surface.
2. **Topology is treated as a real distinction.** A graph, a rack, a matrix and a code
   assembly are not the same idea, and "modular" was doing too much work covering all four.
3. **It records niceties.** The small integrated conveniences — SynthEdit's live hoverscopes,
   Video Painter's Hitching Mode, Multiphonics patching without interrupting the sound — are
   cross-indexed by what they're *for*, so family resemblances appear across unrelated products.

## What's here

```
index.html            the reader — no build step, no framework
app.js                renderer; reads everything from data/
data/systems.json     the specimens
data/schema.json      JSON Schema for the above
data/vocabulary.json  controlled vocabulary: topologies, facets, evidence tags, themes
tools/validate.mjs    checks data against schema and vocabulary; runs in CI
```

Nothing about a specimen is hard-coded in `app.js`. If a label reads wrong, the fix is in
`data/vocabulary.json`.

## Running it locally

`fetch()` refuses `file://` URLs, so double-clicking `index.html` will show a loading error.
Serve the folder instead:

```sh
python3 -m http.server
# → http://localhost:8000
```

To check the data:

```sh
node tools/validate.mjs
```

No dependencies — it runs on a bare Node install so a first-time contributor can check their
own pull request without an `npm install`.

## The vocabulary, briefly

**Topology** — `graph` (modules with ports, you draw the cables) · `rack` (ordered slots,
signal falls through) · `matrix` (sources against destinations in a grid) · `code` (assembly by
text, included only where the work is mostly wiring premade modules) · `format` (not a system
at all — a contract that lets modules exist and travel, filed separately so it's never compared
like for like against an environment).

**Facets** — `midi`, `export`, `encap`, `open`, each in one of four states shown by glyph as
well as colour: ● full, ◐ partial, ○ none, ? unknown. Facets are a navigation summary; they
carry no evidence of their own and inherit it from the claims beneath them.

## Scope

Representative specimens, not exhaustive coverage. The test for inclusion is whether an entry
shows something the others don't. Without that test, "any synth with a modulation matrix"
swallows the whole cabinet — which is why Unfiltered Audio's LION and Sandman Pro appear as a
single boundary-marker entry rather than as specimens.

Known gaps are listed in [`CONTRIBUTING.md`](CONTRIBUTING.md); the largest are visual systems
and their runtime interchange layer (Syphon, Spout, NDI, ISF), which moves frames rather than
patches and probably needs its own facets.

## Corrections

This list has been wrong in public and will be again. It said Bitwig's Grid had no MIDI, when
Note Grid shipped in 4.2 in March 2022. It filed LV2 and AUv3 alongside compilers, when they
are formats. It lost ten specimens in a rewrite. Every fix is in the git history — the evidence
tags exist so the next error is easier to find than the last one was.

## Licence

- **Data** (`data/`) — [CC0 1.0](LICENSE-CC0). Facts about software shouldn't be encumbered;
  take them, fork them, no attribution required.
- **Code** (`index.html`, `app.js`, `tools/`) — [MIT](LICENSE).

Same split as [enkerli/manifold](https://github.com/enkerli/manifold), which catalogues
expressive MIDI controller profiles. That project records the controllers; this one records
the systems they end up driving.
