// The Price Ledger — application logic.
// Renders the ledger from data.js, entirely client-side. Hash routes:
//   #/                      the ledger, with optional filter query (?cat=..&min=..&q=..)
//   #/deal/<id>             one product's investigation page

const VERDICTS = {
  genuine:     { label: "Genuine Deal",        short: "GENUINE" },
  good:        { label: "Good Price",          short: "GOOD" },
  questionable:{ label: "Questionable Discount", short: "QUESTIONABLE" },
  poor:        { label: "Poor Value",          short: "POOR VALUE" },
};
const CONF = { high: "High confidence", medium: "Medium confidence", limited: "Limited evidence" };

const $ = (sel) => document.querySelector(sel);

function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
}
function pctOff(deal) {
  return Math.round((1 - deal.sale / deal.usual) * 100);
}
function effectivePct(deal) {
  // The honest discount: against the typical observed price when we have one,
  // otherwise against the store's usual price.
  const ref = deal.typical ? deal.typical.price : deal.usual;
  return Math.round((1 - deal.sale / ref) * 100);
}
function dealScore(deal) {
  let s = effectivePct(deal);
  if (deal.verdict === "genuine") s += 6;
  if (deal.verdict === "questionable") s -= 10;
  if (deal.verdict === "poor") s -= 22;
  if (deal.alsoAt.length && deal.sale <= Math.min(...deal.alsoAt.map((a) => a[1]))) s += 4;
  return Math.max(1, Math.min(99, s));
}
function bestPriceNote(deal) {
  if (!deal.alsoAt.length) return "";
  const prices = deal.alsoAt.map((a) => a[1]);
  const min = Math.min(...prices);
  if (deal.sale <= min) return "Lowest price found";
  return "Beaten by $" + (deal.sale - min).toFixed(2).replace(/\.00$/, "") + " elsewhere";
}

/* ---------- metrics strip ---------- */
function renderMetrics() {
  const total = DEALS.length;
  const genuine = DEALS.filter((d) => d.verdict === "genuine").length;
  const flagged = DEALS.filter((d) => d.verdict === "questionable" || d.verdict === "poor").length;
  const stores = new Set(DEALS.map((d) => d.store)).size;
  const cross = DEALS.filter((d) => d.alsoAt.length).length;
  const cells = [
    [total, "deals investigated"],
    [genuine, "graded genuine"],
    [flagged, "flagged as questionable or poor"],
    [cross, "cross-checked at rival stores"],
    [stores, "stores under investigation"],
  ];
  $("#metrics").innerHTML = cells
    .map(([n, label]) => `<div class="metric"><span class="metric-n">${n}</span><span class="metric-label">${label}</span></div>`)
    .join("");
}

/* ---------- filters ---------- */
const state = { q: "", cat: "All", store: "", min: 0, verdict: "", verified: false, sort: "score" };

function buildFilterControls() {
  const cats = ["All", ...new Set(DEALS.map((d) => d.cat))];
  $("#cat-chips").innerHTML = cats
    .map((c) => `<button type="button" class="chip${c === state.cat ? " on" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
  const stores = [...new Set(DEALS.map((d) => d.store))];
  $("#f-store").innerHTML = `<option value="">All stores</option>` + stores.map((s) => `<option>${s}</option>`).join("");
}

function applyStateToControls() {
  $("#q").value = state.q;
  $("#f-store").value = state.store;
  $("#f-min").value = String(state.min);
  $("#f-verdict").value = state.verdict;
  $("#f-sort").value = state.sort;
  $("#f-verified").checked = state.verified;
  document.querySelectorAll("#cat-chips .chip").forEach((b) => b.classList.toggle("on", b.dataset.cat === state.cat));
}

function readControlsIntoState() {
  state.q = $("#q").value.trim().toLowerCase();
  state.store = $("#f-store").value;
  state.min = Number($("#f-min").value);
  state.verdict = $("#f-verdict").value;
  state.sort = $("#f-sort").value;
  state.verified = $("#f-verified").checked;
}

function filteredDeals() {
  let list = DEALS.filter((d) => {
    if (state.cat !== "All" && d.cat !== state.cat) return false;
    if (state.store && d.store !== state.store) return false;
    if (pctOff(d) < state.min) return false;
    if (state.verdict && d.verdict !== state.verdict) return false;
    if (state.verified && d.conf === "limited") return false;
    if (state.q) {
      const hay = (d.name + " " + d.brand + " " + d.cat + " " + d.store).toLowerCase();
      if (!hay.includes(state.q)) return false;
    }
    return true;
  });
  const by = {
    score: (a, b) => dealScore(b) - dealScore(a),
    discount: (a, b) => pctOff(b) - pctOff(a),
    saving: (a, b) => (b.usual - b.sale) - (a.usual - a.sale),
    "price-asc": (a, b) => a.sale - b.sale,
    "price-desc": (a, b) => b.sale - a.sale,
  }[state.sort];
  return list.sort(by);
}

/* ---------- ledger rows ---------- */
function rowHtml(d) {
  const pct = pctOff(d);
  const eff = effectivePct(d);
  const also = d.alsoAt.length
    ? `<div class="also">Also seen: ${d.alsoAt.map(([s, p]) => `${s} ${money(p)}`).join(" · ")}</div>`
    : "";
  const integrity = d.typical
    ? `<div class="integrity">Advertised −${pct}% vs list · actual −${eff}% vs typical price</div>`
    : "";
  return `
  <article class="row verdict-${d.verdict}" data-id="${d.id}">
    <div class="row-verdict">
      <span class="badge b-${d.verdict}">${VERDICTS[d.verdict].short}</span>
      <span class="score"><span class="score-n">${dealScore(d)}</span><span class="score-label">deal score</span></span>
      <span class="conf">${CONF[d.conf]}</span>
    </div>
    <div class="row-main">
      <h3 class="row-name"><a href="#/deal/${d.id}">${d.name}</a></h3>
      <div class="row-meta">${d.cat} · ${d.store} · <span class="checked">Price checked · ${d.checked}</span></div>
      <p class="row-note">${d.note}</p>
      ${also}${integrity}
    </div>
    <div class="row-price">
      <span class="sale">${money(d.sale)}</span>
      <span class="usual">${money(d.usual)}</span>
      <span class="pct">−${pct}%</span>
      <span class="best">${bestPriceNote(d)}</span>
      <a class="investigate" href="#/deal/${d.id}">Investigation →</a>
    </div>
  </article>`;
}

function renderList() {
  const list = filteredDeals();
  $("#deal-list").innerHTML = list.map(rowHtml).join("");
  $("#empty").hidden = list.length > 0;
  $("#result-line").textContent =
    `Showing ${list.length} of ${DEALS.length} investigated deals · sorted by ${$("#f-sort").selectedOptions[0].textContent.toLowerCase()}`;
}

/* ---------- investigation (detail) page ---------- */
function renderDeal(id) {
  const d = DEALS.find((x) => x.id === id);
  const view = $("#deal-view");
  if (!d) { view.innerHTML = `<p class="empty">No such entry. <a href="#/">Back to the ledger</a></p>`; return; }
  const pct = pctOff(d);
  const eff = effectivePct(d);
  const storeRows = [[d.store, d.sale, "This entry"], ...d.alsoAt.map(([s, p]) => [s, p, "Observed in the same checks"])]
    .sort((a, b) => a[1] - b[1])
    .map(([s, p, kind]) => `<tr${p === d.sale && s === d.store ? ' class="is-this"' : ""}><td>${s}</td><td class="num">${money(p)}</td><td>${kind}</td></tr>`)
    .join("");
  const integrity = d.typical
    ? `<div class="panel integrity-panel">
         <h4>Reference-price integrity</h4>
         <div class="integrity-grid">
           <div><span class="ig-n">−${pct}%</span><span class="ig-label">advertised, vs the $${d.usual} list price</span></div>
           <div><span class="ig-n">−${eff}%</span><span class="ig-label">actual, vs the typical observed price of ${money(d.typical.price)}</span></div>
         </div>
         <p>${d.typical.basis}. When the two numbers disagree, we grade on the second one.</p>
       </div>`
    : "";
  view.innerHTML = `
    <p class="back"><a href="#/">← Back to the ledger</a></p>
    <div class="detail-head">
      <span class="badge b-${d.verdict}">${VERDICTS[d.verdict].label}</span>
      <span class="conf">${CONF[d.conf]}</span>
      <span class="score"><span class="score-n">${dealScore(d)}</span><span class="score-label">deal score / 100</span></span>
    </div>
    <h2 class="detail-name">${d.name}</h2>
    <p class="detail-meta">${d.brand} · ${d.cat} · sold by ${d.store}</p>
    <div class="detail-grid">
      <div class="panel price-panel">
        <div class="pp-sale">${money(d.sale)}</div>
        <div class="pp-usual">usual price ${money(d.usual)} · save ${money(d.usual - d.sale)} (−${pct}%)</div>
        <a class="store-btn" href="${d.url}" target="_blank" rel="noopener">See it at ${d.store} ↗</a>
        <p class="pp-note">The link opens the exact product page our researchers checked.</p>
      </div>
      <div class="panel">
        <h4>Why this verdict</h4>
        <p>${d.note}</p>
        <h4>Evidence</h4>
        <table class="evidence">
          <tr><th>Price checked</th><td>${d.checked}, during Black Friday week 2026</td></tr>
          <tr><th>Source</th><td>${d.source}</td></tr>
          <tr><th>Confidence</th><td>${CONF[d.conf]} — ${d.conf === "high" ? "corroborated by the store's own page or multiple independent trackers" : d.conf === "medium" ? "reported by an established deal tracker and spot-checked" : "a single tracked source; percentage claims should be read with care"}</td></tr>
        </table>
      </div>
    </div>
    ${integrity}
    <div class="panel">
      <h4>The same product, across stores</h4>
      ${d.alsoAt.length
        ? `<table class="stores"><tr><th>Store</th><th>Price</th><th>Basis</th></tr>${storeRows}</table>`
        : `<p>We found no rival-store listing for this exact product during our checks, so this entry rests on the selling store's own figures and its tracker's record.</p>`}
    </div>`;
}

/* ---------- routing ---------- */
function parseHash() {
  const h = location.hash.replace(/^#/, "") || "/";
  const [path, qs] = h.split("?");
  const params = new URLSearchParams(qs || "");
  return { path, params };
}

function route() {
  const { path, params } = parseHash();
  const dealMatch = path.match(/^\/deal\/(.+)$/);
  if (dealMatch) {
    $("#home-view").hidden = true;
    $("#controls").style.display = "none";
    $("#deal-view").hidden = false;
    renderDeal(dealMatch[1]);
    window.scrollTo(0, 0);
    return;
  }
  $("#deal-view").hidden = true;
  $("#controls").style.display = "";
  $("#home-view").hidden = false;
  if (params.has("cat")) state.cat = params.get("cat");
  if (params.has("min")) state.min = Number(params.get("min"));
  if (params.has("store")) state.store = params.get("store");
  if (params.has("verdict")) state.verdict = params.get("verdict");
  if (params.has("q")) state.q = params.get("q").toLowerCase();
  if (params.has("verified")) state.verified = params.get("verified") === "1";
  if (params.has("sort")) state.sort = params.get("sort");
  applyStateToControls();
  renderList();
}

function syncHashFromState() {
  const p = new URLSearchParams();
  if (state.cat !== "All") p.set("cat", state.cat);
  if (state.min) p.set("min", String(state.min));
  if (state.store) p.set("store", state.store);
  if (state.verdict) p.set("verdict", state.verdict);
  if (state.q) p.set("q", state.q);
  if (state.verified) p.set("verified", "1");
  if (state.sort !== "score") p.set("sort", state.sort);
  const qs = p.toString();
  history.replaceState(null, "", "#/" + (qs ? "?" + qs : ""));
}

function onFilterChange() {
  readControlsIntoState();
  syncHashFromState();
  renderList();
}

document.addEventListener("DOMContentLoaded", () => {
  renderMetrics();
  buildFilterControls();
  ["q", "f-store", "f-min", "f-verdict", "f-sort", "f-verified"].forEach((id) => {
    $("#" + id).addEventListener("input", onFilterChange);
    $("#" + id).addEventListener("change", onFilterChange);
  });
  $("#cat-chips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.cat = btn.dataset.cat;
    applyStateToControls();
    syncHashFromState();
    renderList();
  });
  window.addEventListener("hashchange", route);
  route();
});
