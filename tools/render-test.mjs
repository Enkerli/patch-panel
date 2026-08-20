// Headless check that app.js renders correctly against the real data files.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const els = {};
const mk = () => ({ innerHTML: "", textContent: "", value: "", dataset: {}, addEventListener() {}, setAttribute() {} });

const ctx = {
  document: {
    getElementById: (id) => (els[id] ??= mk()),
    querySelectorAll: () => []
  },
  fetch: async (p) => ({ json: async () => JSON.parse(readFileSync(new URL("../" + p, import.meta.url), "utf8")) }),
  console
};
vm.createContext(ctx);
vm.runInContext(readFileSync(new URL("../app.js", import.meta.url), "utf8"), ctx);

await new Promise((r) => setTimeout(r, 200));

const rack = els.rack.innerHTML;
const checks = {
  "specimens rendered": (rack.match(/class="mod"/g) || []).length,
  "jack badges": (rack.match(/class="jack /g) || []).length,
  "glyphs present": (rack.match(/class="st" aria-hidden/g) || []).length,
  "aria-labels": (rack.match(/aria-label=/g) || []).length,
  "evidence badges": (rack.match(/class="ev ev-/g) || []).length,
  "source links": (rack.match(/<a class="ev/g) || []).length,
  "topology cards": (els.topos.innerHTML.match(/class="topo"/g) || []).length,
  "key blocks": (els.keys.innerHTML.match(/class="key"/g) || []).length,
  "cabinet themes": (els.cab.innerHTML.match(/class="theme"/g) || []).length,
  "filter chips": ["f-topology","f-domains","f-facets","f-platforms"].reduce((n,k)=>n+(els[k].innerHTML.match(/class="chip"/g)||[]).length,0)
};
for (const [k, v] of Object.entries(checks)) console.log(`  ${k}: ${v}`);
console.log("  count line:", els.count.textContent);
console.log("  stats line:", els.stats.innerHTML.replace(/<[^>]+>/g, ""));
const fail = checks["specimens rendered"] !== 43 || checks["jack badges"] !== 43 * 4;
console.log(fail ? "\nRENDER TEST FAILED" : "\nRender test passed.");
process.exit(fail ? 1 : 0);
