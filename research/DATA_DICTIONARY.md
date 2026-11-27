# Data dictionary

The dataset lives in `app/data.js` (the site's own file) and is mirrored for
research use in `research/price-observations.json` and
`research/competitor-prices.json`.

## Deal record (app/data.js → DEALS[])

| Field | Meaning |
| --- | --- |
| `deal_id` (`id`) | Stable slug for the entry; used in `#/deal/<id>` URLs. |
| `product_id` | The product itself; one product can in principle carry several deals, keyed by store. In this edition each product appears once, at its best checked store. |
| `name` | Product name as sold. |
| `brand` | Manufacturer brand. |
| `cat` | Category: Audio, Wearables, Computers, Phones, Smart Home, Accessories, Gaming, Toys, Home & Kitchen. |
| `store_id` (`store`) | Selling store: Amazon, Walmart, or Target in this edition. |
| `product_url` (`url`) | Direct link to the product page checked at that store. |
| `sale_price` (`sale`) | Price at check time, USD. |
| `claimed_original_price` (`usual`) | The usual/list price the store showed beside the sale price, USD. "Claimed" because some list prices are rarely charged — see `typical`. |
| `checked_at` (`checked`) | Date the price was checked, e.g. "Nov 27, 2026". |
| `source` | Where the price was verified (tracker roundup or the store's own page). |
| `verdict` | `genuine` \| `good` \| `questionable` \| `poor` — see methodology.md. |
| `confidence` (`conf`) | `high` \| `medium` \| `limited` — strength of evidence, graded separately from the verdict. |
| `availability_status` | All entries were in stock at check time; recorded in price-observations.json. |
| `note` | One-line justification of the verdict, written by the researcher. |
| `alsoAt` | Rival-store observations for the same product: `[store, price]` pairs from the same checks. |
| `typical` | Optional. `{ price, basis }`: an earlier observed selling price for the same product, with the source that showed it. Present only where we actually observed one. |

## Derived values (computed in app/main.js)

| Value | Formula |
| --- | --- |
| Advertised discount | `round((1 − sale / usual) × 100)` percent. |
| Honest discount | Same formula against `typical.price` when a typical price exists. |
| Deal score | Honest discount, +6 genuine / −10 questionable / −22 poor, +4 when the entry is the lowest price found for its product; clamped to 1–99. |

## Research files

| File | Contents |
| --- | --- |
| `research/price-observations.json` | One observation per deal: product, store, product URL, sale price, claimed original price, advertised discount %, check date, source, availability. |
| `research/competitor-prices.json` | One row per cross-store comparison: primary store/price, compared store/price, gap. |
| `research/verification-log.csv` | The researchers' check actions with UTC timestamps. |
| `research/methodology.md` | How verdicts and confidence grades are decided. |
