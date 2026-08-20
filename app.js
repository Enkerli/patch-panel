/* Patch Panel renderer.
 *
 * Everything on the page comes from data/systems.json and data/vocabulary.json.
 * Nothing about a specimen is hard-coded here — if a label looks wrong, fix the
 * vocabulary, not this file.
 *
 * Note on running locally: fetch() refuses file:// URLs, so opening index.html
 * by double-clicking will show the loading error below. Serve the directory
 * instead:  python3 -m http.server  →  http://localhost:8000
 */

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let DATA, VOCAB;
const active = { topology: new Set(), domains: new Set(), platforms: new Set(), facets: new Set() };

async function boot() {
  try {
    const [d, v] = await Promise.all([
      fetch("data/systems.json").then((r) => r.json()),
      fetch("data/vocabulary.json").then((r) => r.json())
    ]);
    DATA = d;
    VOCAB = v;
  } catch (e) {
    $("rack").innerHTML =
      `<p class="loaderr"><b>Could not load the data.</b> This page reads
       <code>data/systems.json</code> over fetch, which browsers refuse on
       <code>file://</code>. Serve the folder instead —
       <code>python3 -m http.server</code> — and open
       <code>http://localhost:8000</code>.</p>`;
    return;
  }
  header();
  controls();
  render();
  cabinet();
  stats();
}

/* ---------- header: topology definitions and keys, from the vocabulary ---------- */
function header() {
  $("topos").innerHTML = Object.entries(VOCAB.topology)
    .map(
      ([, t]) => `<div class="topo"><h3>${esc(t.label)}</h3>
        <span class="glyph">${esc(t.glyph)}</span>
        <p>${esc(t.definition)}</p></div>`
    )
    .join("");

  const ev = Object.entries(VOCAB.evidence)
    .map(([k, e]) => `<li><span class="ev ev-${k[0]}">${esc(e.short)}</span> ${esc(e.definition.split(".")[0].toLowerCase())}</li>`)
    .join("");
  const facets = Object.entries(VOCAB.facets)
    .map(
      ([k, f]) =>
        `<li><span class="jack j-${k} yes"><span class="st">●</span>${esc(f.label)}</span> ${esc(
          f.definition.split(".")[0].toLowerCase()
        )}</li>`
    )
    .join("");
  const states = Object.entries(VOCAB.facet_states)
    .map(([k, s]) => `<li><span class="jack j-encap ${k}"><span class="st">${esc(s.glyph)}</span>${esc(s.word)}</span></li>`)
    .join("");

  $("keys").innerHTML =
    `<div class="key"><h4>Evidence</h4><ul>${ev}</ul></div>` +
    `<div class="key"><h4>Facets</h4><ul>${facets}</ul></div>` +
    `<div class="key"><h4>States — read the glyph, not the colour</h4><ul>${states}</ul></div>`;
}

/* ---------- filters ---------- */
function chips(group, terms, labeller) {
  return terms
    .map((t) => `<button class="chip" data-group="${group}" data-key="${esc(t)}" aria-pressed="false">${esc(labeller(t))}</button>`)
    .join("");
}
function controls() {
  $("f-topology").innerHTML = chips("topology", Object.keys(VOCAB.topology), (t) => VOCAB.topology[t].label);
  $("f-domains").innerHTML = chips("domains", Object.keys(VOCAB.domains), (d) => d);
  $("f-platforms").innerHTML = chips("platforms", Object.keys(VOCAB.platforms), (p) => VOCAB.platforms[p].label);
  $("f-facets").innerHTML = chips("facets", Object.keys(VOCAB.facets), (f) => VOCAB.facets[f].label);

  document.querySelectorAll(".chip").forEach((c) =>
    c.addEventListener("click", () => {
      const set = active[c.dataset.group];
      const on = set.has(c.dataset.key);
      on ? set.delete(c.dataset.key) : set.add(c.dataset.key);
      c.setAttribute("aria-pressed", String(!on));
      render();
    })
  );
  $("q").addEventListener("input", render);
}

/* ---------- evidence badge ---------- */
function badge(evidence, source) {
  const short = VOCAB.evidence[evidence]?.short ?? "?";
  const cls = `ev ev-${evidence[0]}`;
  const title = VOCAB.evidence[evidence]?.definition ?? "";
  return source
    ? `<a class="${cls}" href="${esc(source)}" target="_blank" rel="noopener" title="${esc(title)}">${short}</a>`
    : `<span class="${cls}" title="${esc(title)}">${short}</span>`;
}

/* ---------- specimen list ---------- */
function render() {
  const term = $("q").value.trim().toLowerCase();
  const list = DATA.systems.filter((s) => {
    if (term) {
      const hay = [s.name, s.developer, s.summary, ...s.claims.map((c) => c.label + " " + c.text), ...s.niceties.map((n) => n.text)]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(term)) return false;
    }
    if (active.topology.size && !active.topology.has(s.topology)) return false;
    for (const d of active.domains) if (!s.domains.includes(d)) return false;
    for (const p of active.platforms) if (!s.platforms.includes(p)) return false;
    for (const f of active.facets) if (!["yes", "partial"].includes(s.facets[f])) return false;
    return true;
  });

  $("count").textContent = `${list.length} of ${DATA.systems.length} specimens`;

  $("rack").innerHTML =
    list
      .map((s) => {
        const doms = s.domains.map((d) => `<span class="dom ${d}">${esc(VOCAB.domains[d].label)}</span>`).join("");
        const plats = s.platforms
          .map((p) => `<span class="plat ${active.platforms.has(p) ? "hi" : ""}">${esc(VOCAB.platforms[p].label)}</span>`)
          .join("");
        const jacks = Object.keys(VOCAB.facets)
          .map((k) => {
            const st = s.facets[k];
            const { glyph, word } = VOCAB.facet_states[st];
            return `<span class="jack j-${k} ${st}" title="${esc(VOCAB.facets[k].label)}: ${word}"
              aria-label="${esc(VOCAB.facets[k].label)} ${word}"><span class="st" aria-hidden="true">${glyph}</span>${esc(
              VOCAB.facets[k].label
            )}</span>`;
          })
          .join("");
        const claims = s.claims
          .map((c) => `<div class="claim"><dt>${esc(c.label)}</dt><dd>${esc(c.text)}${badge(c.evidence, c.source)}</dd></div>`)
          .join("");
        const nice = s.niceties.length
          ? `<div class="nice"><h5>Niceties</h5>${s.niceties
              .map(
                (n) =>
                  `<div><em>${esc(VOCAB.nicety_themes[n.theme]?.label ?? n.theme)}</em>${esc(n.text)}${badge(
                    n.evidence,
                    n.source
                  )}</div>`
              )
              .join("")}</div>`
          : "";
        return `<article class="mod" id="${esc(s.id)}"><div class="rail" data-t="${esc(s.topology)}"></div>
        <details class="body"><summary>
          <span class="name">${esc(s.name)}</span>
          <span class="topotag">${esc(VOCAB.topology[s.topology].label)}</span>
          ${doms}
          <span class="meta">${esc(s.developer)} · ${esc(s.year)}</span>
          <span class="plats">${plats}</span>
          <span class="jacks">${jacks}</span>
        </summary>
        <div class="pane"><p class="blurb">${esc(s.summary)}</p><dl class="claims">${claims}</dl>${nice}</div>
        </details></article>`;
      })
      .join("") || `<p class="meta" style="padding:24px 4px">Nothing matches. Clear a filter.</p>`;
}

/* ---------- cabinet of details ---------- */
function cabinet() {
  const by = {};
  for (const s of DATA.systems) for (const n of s.niceties) (by[n.theme] ??= []).push([s, n]);
  $("cab").innerHTML = Object.keys(VOCAB.nicety_themes)
    .filter((k) => by[k])
    .map(
      (k) =>
        `<div class="theme"><h3>${esc(VOCAB.nicety_themes[k].label)}</h3>` +
        by[k]
          .map(([s, n]) => `<div><b>${esc(s.name)}</b> — ${esc(n.text)}${badge(n.evidence, n.source)}</div>`)
          .join("") +
        `</div>`
    )
    .join("");
}

/* ---------- the page reports its own evidence state ---------- */
function stats() {
  const c = { verified: 0, reported: 0, unverified: 0 };
  for (const s of DATA.systems) for (const r of [...s.claims, ...s.niceties]) c[r.evidence]++;
  const total = c.verified + c.reported + c.unverified;
  $("stats").innerHTML =
    `v${esc(DATA.version)}, updated ${esc(DATA.updated)} — ${DATA.systems.length} specimens, ${total} claims: ` +
    `${c.verified} checked, ${c.reported} reported, <b>${c.unverified} unverified</b> ` +
    `(${Math.round((100 * c.unverified) / total)}%). The unverified ones are the open jobs; ` +
    `see CONTRIBUTING.md for how to promote one.`;
}

boot();
