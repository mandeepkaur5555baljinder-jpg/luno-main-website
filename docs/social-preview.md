# Social preview (Open Graph / Twitter card)

All share metadata lives in the `<head>` of `index.html`, between the `SOCIAL PREVIEW` comment and the
canonical link. There is **one asset to replace**:

| | |
|---|---|
| File | `public/og-image.jpg` (served at `https://www.lunoai.in/og-image.jpg`) |
| Size | **1200 × 630 px** (1.91 : 1) |
| Format | JPEG, progressive, ideally under 300 KB (WhatsApp / iMessage drop images over ~600 KB) |
| Safe area | Keep key content inside the central ~1000 × 520 px; some platforms crop the edges |
| Alt text | `og:image:alt` and `twitter:image:alt` in `index.html`, update if the artwork changes |

## Current state

`public/og-image.jpg` is a **placeholder** rendered from the hero (orb + headline, no UI chrome).
Replace it with final art by overwriting the file; keep the filename so no HTML changes are needed.
Do not put provider or model names in the artwork.

## After replacing

Crawlers cache previews aggressively. Re-scrape with the platforms' debuggers:

- Facebook / WhatsApp / Instagram: https://developers.facebook.com/tools/debug/
- LinkedIn: https://www.linkedin.com/post-inspector/
- X: paste the URL into a draft post to preview
- Slack / iMessage cache per link: use a query string (`?v=2`) to test

## Notes

- The site is a client-rendered SPA. Social crawlers do not run JavaScript, which is why every tag is in the
  static `index.html` rather than being set from React. If per-route previews are ever needed, that is the
  point to add prerendering (not before).
- `og:url` / `og:image` use the production origin (`https://www.lunoai.in`). Change both if the canonical domain changes.
