# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML site for **Pousada Recanto dos Pôneis** — rural lodge in Rio Rufino, Serra Catarinense (SC). Built on the Komplexa Hotéis template. No build tools, no frameworks, no package.json. Pure HTML5, CSS3, vanilla JavaScript. Deploy by pushing to GitHub — the user keeps `main` in sync with `https://github.com/cauasalomao/recanto-dos-poneis` and deploys from there. The user's standing preference is: **commit and push to origin/main after every code change, without being asked.**

## Development

No build or install. Open any `index.html` in a browser or run a local server:

```bash
python -m http.server 8000
# or
npx serve .
```

No tests, no linting.

## Architecture

### Page structure

Each page is a separate directory with `index.html` for clean URLs:

```
/                            Home (hero + strip + about/experiences/rooms/blog previews + CTA)
/sobre/                      About, history
/experiencia/                Activities (Passeio a Cavalo, Pescaria, Quadriciclo, Pet, etc)
/acomodacoes/                4 chalés in a grid (no filters)
/galeria/                    Full photo gallery with lightbox (no filters — renders from a single array)
/localizacao/                Map + nearby attractions
/contato/                    Contact form + map
/blog/                       Blog index
/blog/_template/             Template for new posts (uses %%PLACEHOLDER%% markers)
/blog/{slug}/                Individual blog posts
```

Root also contains `hotel-config.json`, `blog-plan.json`, `sitemap.xml`, `robots.txt`, two markdown briefings (client reference), and an uncurated `fotos/` upload folder.

### Single CSS file — `assets/css/style.css`

All styles in one file, driven by CSS custom properties (`--accent: #5b7a3d` forest green, `--cta: #f6b230` gold, `--font-display: 'Pinyon Script'`, `--font-body: 'Raleway'`). Responsive at 768/640/480px. Spacing uses `clamp()`. Sections share short, BEM-like classes: `.rc` room card, `.gi` gallery item, `.exp-card` experience card, `.rp-c` room preview, `.aud-card` audience card, `.fg` form group, `.btn-gold`/`.btn-green`/`.btn-outline`/`.btn-outline-w` buttons.

### Single JS file — `assets/js/main.js`

All interactivity lives here. Key primitives:

- `sendToWebhook(payload)` — POSTs JSON to `WEBHOOK_URL` with `{hotel, origem_pagina, url, timestamp, ...payload}`. Called by all forms.
- `pushLead(tipo)` — pushes a `gerar_lead` GTM dataLayer event with `lead_tipo`.
- `submitContact` — handles the /contato/ form.
- Mobile menu (`openMob`/`closeMob`), sticky header (hero-mode ↔ solid on scroll), lightbox (`openLB`/`closeLB`/`navLB`, reads from `LB_SRCS`), cookie banner, lazy-load observer, tab-title swap on visibility change.

### Constants at the top of `main.js` (edit these, not hardcoded values scattered elsewhere)

```js
const WEBHOOK_URL   // n8n webhook — all form submits POST here
const HOTEL_NAME    // used in every webhook payload
const WA_NUMBER     // '554935127136' — used by modal, no-pontuação
const WA_MESSAGE    // pre-filled text for wa.me?text=
const BOOKING_URL   // legacy, currently same as domain
const MOTOR_BASE    // base for Foco Multimídia: {MOTOR_BASE}/search/{ci}/{co}/{adults}-{age1}-{age2}
```

`MOTOR_BASE` is a placeholder pointing at the domain root — once the Foco Multimídia URL is known, change this single constant. The URL format is `{MOTOR_BASE}/search/2026-05-10/2026-05-12/2-5-8` (2 adults + children aged 5 and 8).

## Two global modals injected via JS

Both modals are appended to `<body>` at script-run time by IIFEs in `main.js`. Do not add per-page HTML for them. The HTML for both is inside the IIFEs; the CSS lives in `style.css`.

### WhatsApp lead-capture modal (`.wl-*` classes)

Intercepts **every** `a[href*="wa.me/"]` click site-wide (floating button, hero CTAs, footer social, etc). Shows a 340px card anchored bottom-right (desktop) / bottom-centered (mobile). Required fields: nome/email/telefone. On submit: `pushLead('whatsapp_modal')` → webhook → `form.reset()` → close → `window.open('wa.me/{WA_NUMBER}?text=...')`. The secondary "📅 Reservar Agora Online" button closes this modal and calls `openBooking()` — do not repurpose it for another destination. Closes on × / backdrop / Esc.

### Booking modal (`.bk-*` classes) — Foco Multimídia

Triggered only by explicit `onclick="openBooking();return false"` on "Reservar" CTAs. Do **not** intercept links globally — the trigger is opt-in per button. Every "Reservar" / "Reservar Agora" / "Reservar Estadia" / "Fazer Reserva" across the site uses this pattern, including the mobnav version which chains `closeMob();openBooking();return false`. On home the hero WhatsApp CTA was deliberately replaced by "Reservar Agora" pointing at this modal.

Form: check-in / check-out / adults (1–5) / children (0–3). Changing the children select dynamically renders N age selects (0–12). Submit builds the URL and `window.open(url, '_blank', 'noopener')`, then closes. The modal also has a fallback WhatsApp link in the footer. Closes on × / backdrop / Esc.

When adding a new "Reservar"-style CTA anywhere, use:

```html
<a href="#" onclick="openBooking();return false" class="btn-gold">Reservar Agora</a>
```

## Gallery rendering

`/galeria/index.html` has an empty `<div class="gal-g" id="galGrid"></div>` and a single inline `GALLERY` array (path + alt) at the bottom of the page. One script pass builds the grid and populates `LB_SRCS`. To add/remove photos, edit the array only — indexes (`openLB(i)`) are computed.

## Section pattern for alternating dobras (experiência page)

The `experiencia/index.html` inline `<style>` block defines reusable modifiers:

- `.sec-green` / `.sec-green-dark` — solid brand-green section with white text overrides for `.feat-block`, `.txt-block`, `.txt-item`. `sec-green-dark` uses `--accent-hover` (#1a4922).
- `.sec-photo` — fixed-background image section. **Do not use `background-attachment: fixed`** — it is broken globally by `html { zoom: 0.8 }`. Instead: the section has `clip-path: inset(0)` + `isolation: isolate`; `::before` is `position: fixed; inset: 0` with `background-image: var(--bg-photo)`; `::after` is the dark overlay, also fixed. The inline style sets `--bg-photo: url(...)`. This produces a true parallax-fixed image clipped to the section bounds.
- `.aud-grid` / `.aud-card` — 3-column grid of image cards with gradient overlay and a display-font label centered in the bottom third.
- `.quad-split` — image left, text+cards right. Paired with `.quad-cols` (2×2 item grid inside).

## Google Maps embed

Both `/contato/` and `/localizacao/` iframes query by business name, **not** street address: `maps.google.com/maps?q=Pousada+Recanto+dos+P%C3%B4neis,+Rio+Rufino+-+SC&output=embed`. The prior query (`SC+370+Km+34+Rio+Rufino`) made Google interpret two segments and render a driving route instead of a pin. The external "Abrir no Google Maps" link uses `google.com/maps/search/?api=1&query=...` with the same business-name query.

## SEO & structured data

Every page includes Schema.org JSON-LD (LodgingBusiness on home, WebPage + BreadcrumbList elsewhere, BlogPosting on posts), Open Graph tags, Twitter cards, canonical URLs. Site-wide `sitemap.xml` and `robots.txt` live at the root — update `sitemap.xml` whenever a new blog post or page is added.

## Configuration files

- **`hotel-config.json`** — authoritative source for hotel data: contact (phone/email/WA number), address + coordinates, 4 accommodations, activities, packages, pet policy, nearby attractions, local restaurants, integrations (`webhook_url`, `booking_engine_url`), design tokens, blog settings. Keep this in sync with `main.js` constants when values change.
- **`blog-plan.json`** — editorial strategy, SEO rules, post template spec, `published` list, `upcoming` queue. Content pillars: Destino, Experiência, Família, Dicas práticas.

## Blog system

### Creating a new post

1. Pick next item from `blog-plan.json` → `upcoming`.
2. Copy `blog/_template/index.html` → `blog/{slug}/index.html`.
3. Replace every `%%PLACEHOLDER%%` marker (title, meta desc, slug, date, content sections, keyword).
4. Write 800–1200 words: intro with keyword, 3–5 `<h2>` sections, 2+ internal links, `.blog-cta-box` at the end.
5. Add a card to `blog/index.html` inside `#blogGrid`.
6. Add a `<url>` entry to `sitemap.xml`.
7. Move the item from `upcoming` to `published` in `blog-plan.json`.
8. Commit and push.

### Per-post SEO checklist

Unique `<title>` with keyword (format: `{Title} | Blog Pousada Recanto dos Pôneis`), meta description ≤155 chars, canonical URL, Open Graph tags, `article:published_time`, Schema.org `BlogPosting` + `BreadcrumbList` JSON-LD, single `<h1>`, `<h2>` per section, ≥2 internal links, `.blog-cta-box` at the bottom.

## Hotel context (content decisions flow from this)

- **Location**: Rio Rufino, Serra Catarinense, SC — SC 370 highway.
- **History**: family property since 2003, opened as lodge in 2017.
- **4 units**: Chalé Spa Sunset (casais, luxo), Chalé dos Lagos (famílias, vista lago), Chalé dos Pôneis (famílias, animais), Casarão (grupos até 12).
- **Differential**: passeios a cavalo e pôneis inclusos na diária.
- **Target**: famílias 35–45 com crianças, incluindo famílias com crianças autistas buscando contato com animais.
- **Guest origin**: Santa Catarina (Blumenau, Joinville, Floripa, Criciúma) + Rio Grande do Sul.
- **Self-catering**: sem refeições incluídas (cozinha completa em cada unidade); café da manhã planejado.
- **Expansion**: piscina aquecida, infantil, ofurô em obras.
- **Tone**: acolhedor, familiar, autêntico — como receber amigos em casa. Nunca formal.
- **Language**: Brazilian Portuguese throughout.

## Conventions

- Webhook dispatcher handles lead routing; every form goes through `sendToWebhook` + `pushLead`.
- Modals use the `.open` class toggle. `document.body.style.overflow = 'hidden'` while open, restored on close.
- Forms `preventDefault` → webhook → GTM event → UI action (redirect / WhatsApp / success state).
- Inline `<style>` blocks on subpages (sobre, experiencia) hold page-specific rules; global styles stay in `assets/css/style.css`.
- Logo path inside JS-injected markup uses absolute `/assets/img/logo.png` so it resolves correctly from any page depth.
- Don't edit the existing `.wa-modal` legacy CSS — it's unused leftover from the template; the live WhatsApp modal uses `.wl-*` classes.
