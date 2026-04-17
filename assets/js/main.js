/* ============================================================
   POUSADA KARANDÁ — main.js
   Komplexa Hotéis
   ============================================================ */

const WEBHOOK_URL = 'https://webhook.cidigitalmarketing.com/webhook/karanda-leads';
const HOTEL_NAME  = 'Pousada Karandá';
const WA_NUMBER   = '5519953229959';
const WA_MESSAGE  = 'Olá! Gostaria de mais informações sobre a Pousada Karandá.';
const BOOKING_URL = 'https://book.securebookings.net/roomrate?id=5a11db50-224c-1764245213-475e-9fd9-06ac12ffffc6&lang=br';
const MOTOR_BASE  = 'https://book.securebookings.net/roomrate?id=5a11db50-224c-1764245213-475e-9fd9-06ac12ffffc6&lang=br'; // HotelLink Secure Bookings — deep-link aceita &checkin, &checkout, &adults, &children

// ── dataLayer GTM ──
window.dataLayer = window.dataLayer || [];
function pushLead(tipo) {
  window.dataLayer.push({
    event:      'gerar_lead',
    lead_tipo:  tipo,
    pagina:     document.title,
    url:        location.href
  });
}

// ── WEBHOOK ──
async function sendToWebhook(payload) {
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotel: HOTEL_NAME,
        origem_pagina: document.title,
        url: location.href,
        timestamp: new Date().toISOString(),
        ...payload
      })
    });
  } catch(e) { console.warn('Webhook:', e); }
}

// ── HEADER SCROLL ──
const hdr = document.getElementById('hdr');
if (hdr && hdr.classList.contains('hero-mode')) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) { hdr.classList.add('solid'); hdr.classList.remove('hero-mode'); }
    else { hdr.classList.remove('solid'); hdr.classList.add('hero-mode'); }
  }, { passive: true });
}

// ── MOBILE MENU ──
const ham = document.getElementById('ham');
const mob = document.getElementById('mobnav');
function openMob()  { mob?.classList.add('open'); ham?.classList.add('open'); document.body.style.overflow='hidden'; ham?.setAttribute('aria-expanded','true'); }
function closeMob() { mob?.classList.remove('open'); ham?.classList.remove('open'); document.body.style.overflow=''; ham?.setAttribute('aria-expanded','false'); }
ham?.addEventListener('click', () => mob?.classList.contains('open') ? closeMob() : openMob());

// ── LAZY LOAD ──
const imgObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('loaded'); imgObs.unobserve(e.target); } });
}, { rootMargin: '200px' });
document.querySelectorAll('img').forEach(img => {
  if (img.complete && img.naturalWidth > 0) img.classList.add('loaded');
  else {
    img.addEventListener('load',  () => img.classList.add('loaded'), {once:true});
    img.addEventListener('error', () => img.classList.add('loaded'), {once:true});
    imgObs.observe(img);
  }
});


// ── COOKIE BANNER ──
const ckBanner = document.getElementById('cookieBanner');
if (ckBanner && !localStorage.getItem('ck_status')) ckBanner.classList.add('show');
function acceptCookies()  { localStorage.setItem('ck_status','accepted'); if(ckBanner) ckBanner.classList.remove('show'); }
function declineCookies() { localStorage.setItem('ck_status','declined'); if(ckBanner) ckBanner.classList.remove('show'); }

// ── FILTRO QUARTOS ──
function filterRooms(type, btn) {
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#roomsGrid .rc').forEach(rc => {
    rc.style.display = (type==='all' || rc.dataset.type===type) ? '' : 'none';
  });
}

// ── FILTRO GALERIA ──
function filterGal(cat, btn) {
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.gi').forEach(item => {
    item.style.display = (cat === 'all' || item.dataset.cat === cat) ? '' : 'none';
  });
}

// ── LIGHTBOX ──
let lbCur = 0; const LB_SRCS = [];
function openLB(i) {
  lbCur=i; const lbImg=document.getElementById('lbImg'); const lbCnt=document.getElementById('lbCnt');
  if(!lbImg) return;
  lbImg.src=LB_SRCS[i]||''; if(lbCnt) lbCnt.textContent=(i+1)+' / '+LB_SRCS.length;
  document.getElementById('lb')?.classList.add('open'); document.body.style.overflow='hidden';
}
function closeLB() { document.getElementById('lb')?.classList.remove('open'); document.body.style.overflow=''; }
function navLB(d) {
  lbCur=(lbCur+d+LB_SRCS.length)%LB_SRCS.length;
  document.getElementById('lbImg').src=LB_SRCS[lbCur]||'';
  document.getElementById('lbCnt').textContent=(lbCur+1)+' / '+LB_SRCS.length;
}
document.getElementById('lb')?.addEventListener('click', e => { if(e.target===document.getElementById('lb')) closeLB(); });
document.addEventListener('keydown', e => {
  if(!document.getElementById('lb')?.classList.contains('open')) return;
  if(e.key==='Escape') closeLB(); if(e.key==='ArrowLeft') navLB(-1); if(e.key==='ArrowRight') navLB(1);
});

// ── FORMULÁRIO CONTATO ──
async function submitContact(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));

  // GTM
  pushLead('formulario_contato');

  await sendToWebhook({ tipo: 'contato', ...data });
  form.reset();
  document.getElementById('contactOk')?.classList.add('show');
}

// ── TÍTULO DA ABA ao sair da página ──
const tituloOriginal = document.title;
document.addEventListener('visibilitychange', () => {
  document.title = document.hidden
    ? '👋 Volte Aqui — Estamos te esperando!'
    : tituloOriginal;
});

// ── MODAL DE CAPTURA WHATSAPP ──
(function initWaLeadModal() {
  const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  const bookingBlock = `
      <div class="wl-or"><span>ou</span></div>
      <button type="button" class="wl-book">📅 Reservar Agora Online</button>
    `;

  const html = `
    <div class="wl-ov" id="waLeadModal" role="dialog" aria-modal="true" aria-labelledby="waLeadTitle" aria-hidden="true">
      <div class="wl-box" role="document">
        <button class="wl-close" type="button" aria-label="Fechar">×</button>
        <div class="wl-hdr">
          <div class="wl-icon-circle">${WA_SVG}</div>
          <div class="wl-hdr-txt">
            <h4 id="waLeadTitle" class="wl-title">Fale pelo WhatsApp</h4>
            <p class="wl-sub">Preencha para agilizar seu atendimento</p>
          </div>
        </div>
        <form class="wl-form" id="waLeadForm" novalidate>
          <div class="wl-fg">
            <label for="wl-nome">Seu Nome *</label>
            <input id="wl-nome" name="nome" type="text" placeholder="Nome completo" required autocomplete="name">
          </div>
          <div class="wl-fg">
            <label for="wl-email">E-mail *</label>
            <input id="wl-email" name="email" type="email" placeholder="seu@email.com" required autocomplete="email">
          </div>
          <div class="wl-fg">
            <label for="wl-telefone">Telefone *</label>
            <input id="wl-telefone" name="telefone" type="tel" placeholder="(21) 99999-9999" required autocomplete="tel">
          </div>
          <button class="wl-submit" type="submit">Ir para o WhatsApp</button>
        </form>
        ${bookingBlock}
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  const modal  = document.getElementById('waLeadModal');
  const box    = modal.querySelector('.wl-box');
  const form   = document.getElementById('waLeadForm');
  const closeX = modal.querySelector('.wl-close');

  function open()  { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; setTimeout(()=>form.querySelector('input')?.focus(), 50); }
  function close() { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  closeX.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  // intercepta todos os links pro WhatsApp
  document.querySelectorAll('a[href*="wa.me/"]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); open(); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form));
    pushLead('whatsapp_modal');
    await sendToWebhook({ tipo: 'whatsapp_modal', ...data });
    form.reset();
    close();
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`, '_blank', 'noopener');
  });

  // O botão "Reservar Agora Online" abre o modal de reservas do motor
  const bookBtn = modal.querySelector('.wl-book');
  bookBtn?.addEventListener('click', e => {
    e.preventDefault();
    close();
    if (typeof openBooking === 'function') openBooking();
  });
})();

// ── MODAL DE RESERVA (HotelLink Secure Bookings) ──
function buildBookingURL(checkin, checkout, adults, childAges) {
  if (!checkin || !checkout) return null;
  const params = new URLSearchParams();
  params.set('checkin', checkin);
  params.set('checkout', checkout);
  params.set('adults', String(adults || 2));
  if (childAges && childAges.length) {
    params.set('children', String(childAges.length));
    childAges.forEach((age, i) => params.set(`child${i + 1}age`, String(age)));
  }
  const sep = MOTOR_BASE.includes('?') ? '&' : '?';
  return `${MOTOR_BASE}${sep}${params.toString()}`;
}

function openBooking() {
  document.getElementById('bkModal')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeBooking() {
  document.getElementById('bkModal')?.classList.remove('open');
  document.body.style.overflow = '';
}

function updateChildAges() {
  const n = parseInt(document.getElementById('bk-children')?.value || '0');
  const container = document.getElementById('bkChildAges');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const fg = document.createElement('div');
    fg.className = 'fg';
    fg.innerHTML = `<label>Idade criança ${i + 1}</label>
      <select id="bk-child-${i}">
        ${Array.from({length:13}, (_, a) => `<option value="${a}">${a} ${a===1?'ano':'anos'}</option>`).join('')}
      </select>`;
    container.appendChild(fg);
  }
}

function submitBooking(e) {
  e.preventDefault();
  const ci = document.getElementById('bk-checkin').value;
  const co = document.getElementById('bk-checkout').value;
  const adults = document.getElementById('bk-adults').value;
  const nChildren = parseInt(document.getElementById('bk-children')?.value || '0');
  const childAges = [];
  for (let i = 0; i < nChildren; i++) {
    const age = document.getElementById(`bk-child-${i}`)?.value;
    if (age !== undefined) childAges.push(age);
  }
  const url = buildBookingURL(ci, co, adults, childAges);
  if (url) window.open(url, '_blank', 'noopener');
  closeBooking();
}

// Injeta o modal de reservas no final do body
(function injectBookingModal() {
  const waText = encodeURIComponent('Olá, gostaria de fazer uma reserva.');
  const html = `
    <div class="bk-modal" id="bkModal" role="dialog" aria-modal="true" aria-labelledby="bkTitle" aria-hidden="true">
      <div class="bk-modal-box">
        <button class="bk-close" onclick="closeBooking()" aria-label="Fechar">&times;</button>
        <div class="bk-header">
          <img src="/assets/img/logo.png" alt="${HOTEL_NAME}" width="48" height="48">
          <div>
            <h3 id="bkTitle">Reserve sua Estadia</h3>
            <p>Preencha os dados e consulte disponibilidade</p>
          </div>
        </div>
        <form onsubmit="submitBooking(event)" class="bk-form">
          <div class="bk-row">
            <div class="fg">
              <label>Check-in *</label>
              <input type="date" id="bk-checkin" required>
            </div>
            <div class="fg">
              <label>Check-out *</label>
              <input type="date" id="bk-checkout" required>
            </div>
          </div>
          <div class="bk-row">
            <div class="fg">
              <label>Adultos *</label>
              <select id="bk-adults">
                <option value="1">1 adulto</option>
                <option value="2" selected>2 adultos</option>
                <option value="3">3 adultos</option>
                <option value="4">4 adultos</option>
                <option value="5">5 adultos</option>
              </select>
            </div>
            <div class="fg">
              <label>Crianças</label>
              <select id="bk-children" onchange="updateChildAges()">
                <option value="0" selected>Nenhuma</option>
                <option value="1">1 criança</option>
                <option value="2">2 crianças</option>
                <option value="3">3 crianças</option>
              </select>
            </div>
          </div>
          <div class="bk-child-ages" id="bkChildAges"></div>
          <button type="submit" class="bk-submit">Verificar Disponibilidade</button>
          <p class="bk-alt">Prefere falar com a gente?
            <a href="https://wa.me/${WA_NUMBER}?text=${waText}" target="_blank" rel="noopener" class="bk-wa-link">Fale pelo WhatsApp</a>
          </p>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
  const bk = document.getElementById('bkModal');
  bk?.addEventListener('click', e => { if (e.target === bk) closeBooking(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && bk?.classList.contains('open')) closeBooking(); });
})();
