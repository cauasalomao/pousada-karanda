# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML site for **Pousada Karandá** — lodge in Lindóia/SP, Circuito das Águas Paulista. Built by adapting the Komplexa Hotéis template (originally used for Pousada Recanto dos Pôneis). No build tools, no frameworks, no package.json. Pure HTML5, CSS3, vanilla JavaScript. Deploy by pushing to GitHub — the remote is `https://github.com/cauasalomao/pousada-karanda` (main branch). The user's standing preference is: **commit and push to origin/main after every code change, without being asked.** Confirm the remote before pushing — this repo was cloned from the Recanto template, so double-check `git remote -v` points at `pousada-karanda`, not `recanto-dos-poneis`.

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
/                            Home (hero + strip + about/experiences/rooms previews + CTA)
/sobre/                      About, history (founded 2025, Fernando Vieira)
/experiencia/                "Circuito das Águas" — on-site moments + nearby attractions
/acomodacoes/                2 suites (Queen Varanda, Queen com Hidromassagem)
/galeria/                    Photo gallery with lightbox (renders from a single GALLERY array)
/localizacao/                Map + Circuito das Águas cities
/contato/                    Contact form + map
```

No blog. Root also has `hotel-config.json` (authoritative data), `sitemap.xml`, `robots.txt`, and briefing markdowns (client reference, kept for context).

### Single CSS file — `assets/css/style.css`

All styles in one file, driven by CSS custom properties. Karandá palette:

- `--accent: #6a8a6d` (sage green)
- `--accent-hover: #3e5a43` (deep sage)
- `--cta: #c19759` (warm ochre)
- `--cta-hover: #9c7a43`
- `--bg: #fafaf8` (warm white)
- `--surface-light: #efeae1` (cream)
- `--font-display: 'Cormorant Garamond', serif` (elegant contemplative serif)
- `--font-body: 'Raleway', sans-serif`

Responsive at 768/640/480px. Spacing uses `clamp()`. Sections share short, BEM-like classes: `.rc` room card, `.gi` gallery item, `.rp-c` room preview, `.aud-card` audience card, `.fg` form group, `.btn-gold`/`.btn-green`/`.btn-outline`/`.btn-outline-w` buttons.

### Single JS file — `assets/js/main.js`

All interactivity lives here. Key primitives:

- `sendToWebhook(payload)` — POSTs JSON to `WEBHOOK_URL` with `{hotel, origem_pagina, url, timestamp, ...payload}`. Called by all forms.
- `pushLead(tipo)` — pushes a `gerar_lead` GTM dataLayer event with `lead_tipo`.
- `submitContact` — handles the /contato/ form.
- Mobile menu, sticky header (hero-mode ↔ solid on scroll), lightbox (reads from `LB_SRCS`), cookie banner, lazy-load observer, tab-title swap.

### Constants at the top of `main.js` (edit these, not hardcoded values scattered elsewhere)

```js
const WEBHOOK_URL   // n8n webhook — currently placeholder 'karanda-leads', needs real endpoint
const HOTEL_NAME    // 'Pousada Karandá'
const WA_NUMBER     // '5519953229959'
const WA_MESSAGE    // pre-filled text for wa.me?text=
const BOOKING_URL   // HotelLink Secure Bookings full URL
const MOTOR_BASE    // same — used by modal to append deep-link query params
```

`MOTOR_BASE` points to the HotelLink Secure Bookings page with hotel id and `lang=br` already set. The `buildBookingURL()` function appends `&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD&adults=N&children=N&child1age=...` to that URL when the booking modal is submitted. If HotelLink's deep-link param names differ from these, update `buildBookingURL()` only — the modal UI stays the same.

## Two global modals injected via JS

Both modals are appended to `<body>` at script-run time by IIFEs in `main.js`. Do not add per-page HTML for them. The HTML for both is inside the IIFEs; the CSS lives in `style.css`.

### WhatsApp lead-capture modal (`.wl-*` classes)

Intercepts **every** `a[href*="wa.me/"]` click site-wide (floating button, hero CTAs, footer social, etc). Shows a 340px card anchored bottom-right (desktop) / bottom-centered (mobile). Required fields: nome/email/telefone. On submit: `pushLead('whatsapp_modal')` → webhook → `form.reset()` → close → `window.open('wa.me/{WA_NUMBER}?text=...')`. The secondary "📅 Reservar Agora Online" button closes this modal and calls `openBooking()`. Closes on × / backdrop / Esc.

### Booking modal (`.bk-*` classes) — HotelLink Secure Bookings

Triggered only by explicit `onclick="openBooking();return false"` on "Reservar" CTAs. Do **not** intercept links globally — the trigger is opt-in per button. Every "Reservar" / "Reservar Agora" / "Fazer Reserva" across the site uses this pattern, including the mobnav version which chains `closeMob();openBooking();return false`.

Form: check-in / check-out / adults (1–5) / children (0–3). Changing the children select dynamically renders N age selects (0–12). Submit builds the HotelLink URL with query params and `window.open(url, '_blank', 'noopener')`, then closes. The modal also has a fallback WhatsApp link in the footer. Closes on × / backdrop / Esc.

When adding a new "Reservar"-style CTA anywhere, use:

```html
<a href="#" onclick="openBooking();return false" class="btn-gold">Reservar Agora</a>
```

## Gallery rendering

`/galeria/index.html` has an empty `<div class="gal-g" id="galGrid"></div>` and a single inline `GALLERY` array (path + alt) at the bottom of the page. Paths are relative to `../assets/img/`. One script pass builds the grid and populates `LB_SRCS`. To add/remove photos, edit the array only — indexes (`openLB(i)`) are computed. Current photos live under `assets/img/karanda/`.

## Google Maps embed

Both `/contato/` and `/localizacao/` iframes query by business name, **not** street address: `maps.google.com/maps?q=Pousada+Karand%C3%A1,+Lind%C3%B3ia+-+SP&output=embed`. The external "Abrir no Google Maps" link uses `google.com/maps/search/?api=1&query=...` with the same business-name query.

## SEO & structured data

Every page includes Schema.org JSON-LD (LodgingBusiness on home, WebPage + BreadcrumbList elsewhere), Open Graph tags, Twitter cards, canonical URLs pointing at `pousadakaranda.com.br`. Site-wide `sitemap.xml` and `robots.txt` live at the root — update `sitemap.xml` whenever a new page is added.

## Configuration files

**`hotel-config.json`** — authoritative source for hotel data: contact (phone/WhatsApp/emails), address + coordinates (Lindóia/SP), 2 accommodations with rate ranges, breakfast info, integrations (`webhook_url`, `booking_engine_url`), design tokens, owner (Fernando Vieira). Keep this in sync with `main.js` constants when values change.

## Hotel context (content decisions flow from this)

- **Location**: Rodovia Octavio de Oliveira Santos, 7671 — Bairro Rodrigues, Lindóia/SP. CEP 13950-000.
- **Circuito das Águas Paulista**: Águas de Lindóia, Serra Negra, Socorro, Monte Alegre do Sul, Amparo are the main nearby destinations.
- **History**: founded 2025 by Fernando Vieira (proprietário) with the purpose of uniting family and giving guests memorable experiences.
- **2 units**: Suíte Queen com Varanda (Standard, 24m², térreo, Queen, a partir de R$ 400) and Suíte Queen com Varanda e Hidromassagem (Superior, 24m², térreo, Queen, a partir de R$ 500). Both up to 5 people.
- **Breakfast**: included for guests, 08h–10h. R$ 35/pessoa para não hóspedes.
- **Differential**: refúgio contemplativo, localização privilegiada no Circuito das Águas, áreas verdes preservadas, varanda privativa em cada suíte, café da manhã acolhedor.
- **Target**: casais (datas especiais — aniversário de casamento, noivado, lua de mel), famílias e viajantes buscando desaceleração. Público principal: SP (DDD 019 e 011).
- **Policies**: check-in 14h–22h, check-out até 12h, **não pet-friendly**, parcelamento facilitado, impostos e taxas inclusos nas tarifas.
- **Motor de reservas**: HotelLink Solutions (Secure Bookings) — id fixo no `BOOKING_URL`.
- **Gestão digital**: Yah Consultoria (gerencia e-mail `yahreservas@gmail.com`).
- **Tone**: acolhedor, contemplativo, voltado à desaceleração e bem-estar. Nunca formal.
- **Language**: Brazilian Portuguese throughout.

## Conventions

- Webhook dispatcher handles lead routing; every form goes through `sendToWebhook` + `pushLead`.
- Modals use the `.open` class toggle. `document.body.style.overflow = 'hidden'` while open, restored on close.
- Forms `preventDefault` → webhook → GTM event → UI action (redirect / WhatsApp / success state).
- Inline `<style>` blocks on subpages (e.g. experiencia) hold page-specific rules; global styles stay in `assets/css/style.css`.
- Logo path inside JS-injected markup uses absolute `/assets/img/logo.png` so it resolves correctly from any page depth. The Karandá logo is a copy of `assets/img/karanda/logo.png`.
- All Karandá photos live under `assets/img/karanda/`. Recanto's old folders (hero/, atividades/, animais/, etc.) were removed — don't re-reference them.

## Known pending items

- **Favicons** still from Recanto template (`favicon.ico`, `apple-touch-icon.png`, `android-chrome-*.png`). Generate Karandá versions from `assets/img/karanda/logo.png` when ready.
- **WEBHOOK_URL** is a placeholder (`/webhook/karanda-leads`). Create the n8n workflow for Karandá leads and update the constant in `main.js` + `hotel-config.json`.
- **HotelLink deep-link params**: `buildBookingURL()` assumes `checkin`, `checkout`, `adults`, `children`, `child1age`, `child2age`, `child3age`. Confirm with HotelLink / Yah Consultoria that these are the supported param names; if not, only edit `buildBookingURL()`.
- **GTM**: `gtm_id` empty — insert snippet when available.
- **Phone `(84) 9423-1329`**: scraped from the live WordPress site footer but not in briefings — confirm whether to keep on the contact page.
