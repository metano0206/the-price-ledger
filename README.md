# The Price Ledger — Black Friday 2026, investigated

[![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/metano0206/the-price-ledger/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/metano0206/the-price-ledger/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

Bounty: https://make.fun/bounty/black-friday-deal-finder-01

## What this is

An independent price-investigation publication, not a coupon aggregator.
Our researchers checked **39 Black Friday 2026 deals** at the stores selling
them — Amazon, Walmart and Target — recording each product's sale price, the
usual price beside it, the check date and the source. Where the same product
appeared at a rival store during the same checks, we recorded that price too,
and graded every discount on the evidence:

- **Genuine Deal** — deep cut, corroborated.
- **Good Price** — fair, honestly framed.
- **Questionable Discount** — the percentage leans on a reference price
  shoppers rarely pay.
- **Poor Value** — a token cut; wait.

Confidence (High / Medium / Limited evidence) is graded separately from the
verdict, and every entry carries a one-line justification. Where a store's
advertised percentage is measured against a list price but we had observed
the product selling lower earlier in the same sale, the entry shows both
numbers — advertised vs actual — and is graded on the honest one.

## The site

Open `app/index.html` in a browser (or run `node serve.ts` and visit
http://localhost:8080). It is fully static and works offline: search, category
chips, store / minimum-discount / verdict filters, a verified-evidence
toggle, five sort orders, and a per-product investigation page
(`#/deal/<id>`) with the verdict reasoning, an evidence table and the
cross-store price comparison. Filter state lives in the URL hash, so views
are linkable (e.g. `#/?min=40`).

## Handing it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored make.fun
library (`vendor/makefun-frontend.ts`, copied from the kit unchanged):

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The program is deterministic: two runs produce identical bytes.

## Research record

The `research/` directory holds the working papers behind the grades:

- `price-observations.json` — one observation per deal: product, store,
  product URL, sale price, claimed original price, advertised discount,
  check date, source, availability.
- `competitor-prices.json` — every cross-store comparison we made.
- `verification-log.csv` — the check actions, with timestamps.
- `methodology.md` — how verdicts and confidence grades are decided.
- `DATA_DICTIONARY.md` — the data model, field by field.

## Screenshots

`screenshots/` holds four real renders of the site: the cover (ledger home
with credibility metrics and search), an investigation page (AirPods Pro 3),
the explorer with a 40%-or-more filter applied, and a phone-size view.
`shots.json` records the route and viewport for each.

## License

MIT — see `LICENSE`.
