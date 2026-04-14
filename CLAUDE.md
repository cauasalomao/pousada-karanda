# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML website for **Pousada Recanto dos Pôneis**, a rural lodge in Rio Rufino, Serra Catarinense (SC). Built on the Komplexa Hotéis template — no build tools, no frameworks, no package.json. Pure HTML5, CSS3, and vanilla JavaScript. Deploy to any static host (GitHub Pages, Netlify, Vercel).

The template source is in `pousada-montverde-final/pousada-montverde2-main/`. The site for Recanto dos Pôneis is being built by replicating that template with personalized content based on `hotel-config.json` and the two briefing documents.

## Development

No build or install step. Open any `index.html` in a browser or use a local server:

```bash
python -m http.server 8000
# or
npx serve .
```

There are no tests or linting configured.

## Architecture

### Page structure

Each page lives in its own directory with an `index.html` for clean URLs:

```
/index.html          — Home (hero + booking widget + discount popup)
/sobre/              — About the lodge and its history
/experiencia/        — Activities: horseback riding, fishing, ATV, animals
/acomodacoes/        — Accommodation grid (Chalé Spa Sunset, Chalé dos Lagos, Chalé dos Pôneis, Casarão)
/galeria/            — Photo gallery with lightbox and category filters
/localizacao/        — Google Maps embed + nearby attractions
/contato/            — Contact form + map
/blog/               — Blog listing page
/blog/{slug}/        — Individual blog posts
```

### Single CSS file: `assets/css/style.css`

All styling in one file. Uses CSS custom properties (design tokens) for theming. Responsive via breakpoints at 768px, 640px, 480px. Fluid spacing uses `clamp()`.

### Single JS file: `assets/js/main.js`

All interactivity in one file. Key systems:
- **Webhook dispatcher** (`sendToWebhook`) — all forms POST JSON to a configurable webhook URL
- **GTM dataLayer** (`pushLead`) — fires `gerar_lead` events with lead type
- **UI components** — mobile menu, sticky header, lightbox gallery, modals, cookie banner, filters, lazy loading

### Hotel-specific constants (top of `main.js`)

```js
const WEBHOOK_URL = '...';  // Form submission endpoint
const HOTEL_NAME  = '...';  // Used in webhook payloads
```

### External integrations

- **Booking engine** — iframe widget embedded in home page hero
- **Google Tag Manager** — container ID in every HTML `<head>` and `<body>`
- **Google Maps** — iframe embeds in contato and localizacao pages
- **Webhook** — receives all form submissions
- **WhatsApp** — wa.me links with pre-filled messages

### SEO & structured data

Every page includes: Schema.org JSON-LD (LodgingBusiness, WebPage, BreadcrumbList), Open Graph tags, Twitter cards, canonical URLs. Site-level `sitemap.xml` and `robots.txt` at root.

## Configuration files

### `hotel-config.json`

Central config with all hotel-specific data: name, contact, address, accommodations (4 units: Chalé Spa Sunset, Chalé dos Lagos, Chalé dos Pôneis, Casarão), activities, packages, pet policy, nearby attractions, local restaurants, integrations, design tokens, and blog settings. Used by the agent to personalize all content.

### `blog-plan.json`

Editorial strategy and content calendar. Contains editorial strategy, SEO rules, post template specs, published posts, and upcoming planned posts. Content pillars: Destino, Experiência, Família, Dicas práticas.

## Blog system

### Creating a new blog post

1. Read `blog-plan.json` → pick next item from `upcoming`
2. Read `hotel-config.json` → use hotel context, tone, keywords for content
3. Copy `blog/_template/index.html` → `blog/{slug}/index.html`
4. Replace all `%%PLACEHOLDER%%` markers (see template for full list)
5. Write post content: intro with keyword, 3-5 sections with `<h2>`, 2+ internal links, CTA box at end, 800-1200 words
6. Add blog card to `blog/index.html` inside `#blogGrid`
7. Add `<url>` entry to `sitemap.xml`
8. Move post from `upcoming` to `published` in `blog-plan.json`
9. Commit and push

### Blog post SEO checklist

Every post MUST have: unique `<title>` with keyword (format: `{Title} | Blog Pousada Recanto dos Pôneis`), meta description ≤ 155 chars, canonical URL, Open Graph tags, `article:published_time`, Schema.org `BlogPosting` JSON-LD, `BreadcrumbList` JSON-LD, single `<h1>`, `<h2>` per section, 2+ internal links, CTA box.

## Key context about the hotel

- **Location**: Rio Rufino, Serra Catarinense, SC — on the SC 370 highway
- **History**: Family property since 2003, converted to lodge in 2017
- **4 accommodation units**: Chalé Spa Sunset (luxury, couples), Chalé dos Lagos (families, lake view), Chalé dos Pôneis (families, animals), Casarão (groups up to 12)
- **Key differential**: Horseback riding and pony rides included in the daily rate at no extra cost
- **Target audience**: Families 35-45 with children, including families with autistic children seeking animal contact
- **Guest origin**: Mostly Santa Catarina (Blumenau, Joinville, Florianópolis, Criciúma) + Rio Grande do Sul
- **Self-catering**: No meals provided (full kitchen in every unit); breakfast planned for future
- **Expansion in progress**: Heated pool, children's pool, hot tub
- **Tone**: Warm, familiar, authentic — like welcoming friends home. Never formal.
- **Language**: Brazilian Portuguese throughout

## Conventions

- Semantic HTML with BEM-like short class names (`.rc` for room card, `.gi` for gallery item, `.fbtn` for filter button)
- Data attributes drive JS behavior: `data-type` on room cards, `data-cat` on gallery items
- Modals use `.open` class toggle pattern
- Forms prevent default, send webhook, then perform UI action
- Blog content uses standard HTML inside `.blog-post-content`
- Blog CTA boxes use `.blog-cta-box` class

## Replication from template

When generating pages, read `hotel-config.json` for all hotel-specific data and use the template files in `pousada-montverde-final/pousada-montverde2-main/` as the structural reference. Personalize all text, SEO tags, Schema.org data, and design tokens for Pousada Recanto dos Pôneis.
