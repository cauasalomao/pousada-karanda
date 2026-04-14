/* ============================================================
   POUSADA RECANTO DOS PÔNEIS — main.js v3
   Komplexa Hotéis
   ============================================================ */

const WEBHOOK_URL = '';
const HOTEL_NAME  = 'Pousada Recanto dos Pôneis';

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
