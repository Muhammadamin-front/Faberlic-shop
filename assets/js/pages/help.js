/**
 * Faberlic — Yordam
 * Tezkor havolalar, ko'p beriladigan savollar (akkordeon) va aloqa ma'lumotlari.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { formatPrice } from '../core/format.js';
import { esc } from '../core/ui.js';
import { bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
const { shippingFlat, freeShippingThreshold } = config.commerce;
const QUICK = [
  { icon: 'bag', title: 'Buyurtmam qayerda?', sub: 'Buyurtmani kuzatish', href: 'track-order.html' },
  { icon: 'tag', title: 'Promo-kodlar', sub: 'Chegirmalar', href: 'coupons.html' },
  { icon: 'truck', title: 'Yetkazib berish', sub: 'Narx va muddat', href: 'legal.html?doc=shipping' },
  { icon: 'send', title: "Bog'lanish", sub: 'Operatorga yozish', href: 'support.html' },
];
const FAQS = [
  ['Qanday buyurtma beraman?', "Mahsulotni savatga qo'shing, «Rasmiylashtirish» tugmasini bosing, ism, telefon va manzilni kiriting. Operatorimiz siz bilan bog'lanib, buyurtmani tasdiqlaydi."],
  ["To'lovni qanday qilaman?", "Naqd pul (mahsulotni olganda), Click, Payme yoki kartaga o'tkazma orqali. Onlayn to'lov uchun operator sizga havola yoki karta raqamini yuboradi."],
  ['Yetkazib berish qancha turadi?', `Standart yetkazib berish — ${formatPrice(shippingFlat)}.${freeShippingThreshold ? ` ${formatPrice(freeShippingThreshold)} dan ortiq xaridda — bepul.` : ''} Do'kondan o'zingiz olib ketsangiz ham bo'ladi.`],
  ['Necha kunda yetkaziladi?', `${config.brand.city} bo'ylab odatda 1–2 kun ichida, tezkor yetkazishda — shu kunning o'zida. Viloyatlarga 2–5 kun.`],
  ['Mahsulotlar originalmi?', "Ha, barcha mahsulotlar Faberlic kompaniyasining original mahsulotlari."],
  ["Narxi ko'rsatilmagan mahsulotni qanday olaman?", "«Narxni bilish» tugmasini bosing — operatorimiz sizga narx va mavjudligini aytadi."],
  ['Buyurtmani bekor qilsam bo\'ladimi?', "Ha, buyurtma yo'lga chiqmaguncha operatorga yozib bekor qilishingiz mumkin."],
];

document.getElementById('appbar').innerHTML = `<header class="help-header"><div class="header-top">
  <a class="back-button" href="profile.html" aria-label="Orqaga">${icon('back', { size: 24 })}</a>
  <div class="header-center"><h1 class="page-title">${t('profile.help')}</h1>
    <span class="help-subtitle">Sizga yordam beramiz</span></div>
  <span style="width:40px"></span>
</div></header>`;
bindThemeToggle();

screen.innerHTML = `<div class="help-content">
  <div class="quick-actions-section"><h3 class="section-title">Tezkor havolalar</h3>
    <div class="quick-actions-grid">
      ${QUICK.map((q) => `<a class="quick-action-item" href="${q.href}">
        <span class="action-icon">${icon(q.icon, { size: 20 })}</span>
        <span><span class="action-title">${esc(q.title)}</span><br><span class="action-subtitle">${esc(q.sub)}</span></span>
      </a>`).join('')}
    </div>
  </div>

  <div class="faq-section"><h3 class="section-title">Ko'p beriladigan savollar</h3>
    <div class="faq-list">
      ${FAQS.map(([q, a]) => `<div class="faq-item">
        <button class="faq-question">${icon('help', { size: 18 })} <span class="faq-text">${esc(q)}</span>
          <span class="faq-arrow">${icon('chevron', { size: 18 })}</span></button>
        <div class="faq-answer"><p>${esc(a)}</p></div></div>`).join('')}
    </div>
  </div>

  <div class="contact-info-section"><h3 class="section-title">Javob topmadingizmi?</h3>
    <a class="btn btn--block" href="support.html">${icon('send', { size: 18 })} Operatorga yozish</a>
  </div>
</div>`;

screen.querySelectorAll('.faq-question').forEach((btn) => btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open')));
