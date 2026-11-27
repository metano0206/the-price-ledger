# Methodology — how The Price Ledger grades a deal

The Price Ledger is an independent price-investigation desk. For Black Friday
week 2026 our researchers checked 39 deals at the stores selling them and
graded each discount on the evidence, not on the headline percentage.

## What we record for every deal

- The product, the store, and a direct link to the product page checked.
- The sale price and the usual price the store showed at check time.
- The check date and the source the price was verified in
  (see `price-observations.json` for the full record).
- Where the same product was observed at a rival store during the same
  checks, those prices too (see `competitor-prices.json`).
- A verdict, a confidence grade, and a one-line justification. Every action
  behind the dataset is listed in `verification-log.csv`.

## The four verdicts

- **Genuine Deal** — a deep cut (typically 28% or more) that is corroborated:
  matched or beaten nowhere important, at an all-time-low or near it, or
  verified on the store's own product page.
- **Good Price** — a fair, honestly framed discount. Worth buying at this
  price; not a once-a-year event.
- **Questionable Discount** — the advertised percentage leans on a reference
  price shoppers rarely pay (a launch-day list price, a single-sourced
  "usual" price), or a sibling model in the same line took a clearly better
  cut, making this one look inflated by comparison.
- **Poor Value** — a token cut in a category where comparable products were
  discounted more deeply in the same week. Our advice: wait.

## Reference-price integrity

When we had observed the same product selling at a lower "typical" price
earlier in the same sale, we grade against that typical price, not the list
price. Example in this edition: the Echo Dot (2026) advertises 45% off a
$100 list price, but the same Black Friday sale listed it at $75 a week
earlier — an actual reduction of about 27%. Both numbers are shown on the
entry; the verdict follows the honest one. We never publish a typical price
we did not actually observe in a source.

## Confidence — graded separately from the verdict

- **High** — verified on the store's own product page, or reported by two or
  more independent trackers at the same figures.
- **Medium** — reported by one established deal tracker and spot-checked
  against a second source's coverage of the same sale.
- **Limited** — a single tracked source. The price is real as reported, but
  percentage claims built on it should be read with care.

## Deal score

A 0–100 summary computed in `app/main.js` from the honest discount
percentage (against the typical price where we have one), adjusted by
verdict, with a small bonus when the entry is the lowest price we found for
that product. It is a sorting aid, not a substitute for the verdict.

## What we do not do

- No invented products, prices, links, or price histories.
- No affiliate commissions; the Ledger takes nothing from the stores it
  investigates.
- No live prices: every figure is a checked fact about a moment during
  Black Friday week 2026, stamped with its check date.
