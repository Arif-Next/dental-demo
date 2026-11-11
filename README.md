# Smile Care Dental — demo sites

Two static demo clinic websites built as sales assets for the ArifNext dental-website product.

- `en/` — English, six pages: treatments, published prices, smile gallery (before/after sliders),
  about/team, contact with a 3-step booking form that hands off to WhatsApp.
- `bn/` — Bangla, four pages: home, services, about, contact with an appointment form that also hands
  off to WhatsApp (no backend, nothing stored).

Both are plain HTML/CSS/JS with no build step and no backend. Content is illustrative (fictional
practice, fictional reviews and prices), photos are Unsplash stock. Prices were set against published
price lists from six Dhaka practices — see the main project repo's `research/PRICES-SOURCES.md`.

Live: https://arif-next.github.io/dental-demo/

## Re-using a demo for a real clinic

- **Site URL** — canonical, Open Graph, hreflang and JSON-LD URLs are hardcoded to
  `https://arif-next.github.io/dental-demo`. Search-and-replace that string with the client's domain
  (and update `sitemap.xml`).
- **Phone / WhatsApp** — `+8801712345678` is a placeholder. Replace it in the HTML and in the `WA`
  constant at the top of the form code in `en/assets/js/main.js` and `bn/assets/js/main.js`.
- **Images** — every photo ships as WebP in two widths (`name-800.webp`, `name-1200/1280.webp`) and is
  referenced with `srcset`. The few `.jpg` files left are only used as social share (`og:image`) images.
- **Privacy / terms** — not included; add the clinic's own pages and link them from the footer.
