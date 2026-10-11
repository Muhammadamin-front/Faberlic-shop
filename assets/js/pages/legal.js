/**
 * Faberlic — Shartlar, maxfiylik, yetkazib berish
 * Bitta sahifa, tablar bilan. ?doc=terms | privacy | shipping orqali to'g'ridan-to'g'ri ochiladi.
 * Matnni o'z do'koningiz qoidalariga moslab tahrirlang.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { formatPrice } from '../core/format.js';
import { esc } from '../core/ui.js';
import { pageHeader, bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
const brand = config.brand.name;
const { shippingFlat, expressShipping, freeShippingThreshold } = config.commerce;
const DOCS = {
  terms: { label: 'Shartlar', title: 'Foydalanish shartlari', body: [
    ['1. Umumiy', `Ushbu shartlar ${brand} ilovasidan foydalanish va undagi xaridlarga taalluqli. Buyurtma berish orqali siz ularga rozilik bildirasiz.`],
    ['2. Buyurtma va narxlar', "Narxlar so'mda ko'rsatilgan. Buyurtma operator tomonidan telefon yoki Telegram orqali tasdiqlangandan so'ng kuchga kiradi. Narxda xatolik bo'lsa, operator sizga xabar beradi."],
    ["3. To'lov", "To'lov naqd pul (yetkazib berilganda), Click, Payme yoki kartaga o'tkazma orqali amalga oshiriladi."],
    ['4. Qaytarish', "Ochilmagan va ishlatilmagan mahsulotni 3 kun ichida qaytarish mumkin. Ochilgan kosmetika mahsulotlari gigiyena sababli qaytarilmaydi (nuqson bundan mustasno)."],
  ] },
  privacy: { label: 'Maxfiylik', title: 'Maxfiylik siyosati', body: [
    ["1. Qanday ma'lumot olamiz", "Buyurtma uchun kiritgan ismingiz, telefon raqamingiz va manzilingiz hamda Telegram profilingizdagi ism va foydalanuvchi nomi."],
    ['2. Nima uchun', "Faqat buyurtmani yetkazib berish va siz bilan bog'lanish uchun."],
    ['3. Uchinchi shaxslar', "Ma'lumotlaringiz faqat yetkazib berish uchun kuryerga beriladi va hech kimga sotilmaydi."],
    ["4. O'chirish", "Ma'lumotlaringizni o'chirishni xohlasangiz, operatorga yozing."],
  ] },
  shipping: { label: 'Yetkazib berish', title: 'Yetkazib berish', body: [
    ['1. Muddatlar', `${config.brand.city} bo'ylab 1–2 kun, tezkor yetkazish — shu kunning o'zida. Viloyatlarga 2–5 kun.`],
    ['2. Narxi', `Standart — ${formatPrice(shippingFlat)}, tezkor — ${formatPrice(expressShipping ?? shippingFlat)}.${freeShippingThreshold ? ` ${formatPrice(freeShippingThreshold)} dan ortiq xaridda standart yetkazib berish bepul.` : ''}`],
    ['3. Olib ketish', "Buyurtmani do'kondan o'zingiz bepul olib ketishingiz mumkin — operator manzilni aytadi."],
    ['4. Qabul qilish', "Mahsulotni qabul qilayotganda qadoqni tekshiring. Muammo bo'lsa, darhol operatorga xabar bering."],
  ] },
};

let active = new URLSearchParams(location.search).get('doc');
if (!DOCS[active]) active = 'terms';

function render() {
  document.getElementById('appbar').innerHTML = pageHeader({ title: 'Qoidalar', back: 'profile.html' });
  bindThemeToggle();
  const d = DOCS[active];
  screen.innerHTML = `<div class="extra-content">
    <div class="legal-tabs">
      ${Object.entries(DOCS).map(([k, v]) => `<button data-doc="${k}" class="${k === active ? 'active' : ''}">${v.label}</button>`).join('')}
    </div>
    <h1 style="font-size:var(--fs-xl);font-weight:var(--fw-bold);margin-bottom:6px">${esc(d.title)}</h1>
    <div class="legal-body">
      ${d.body.map(([h, p]) => `<h2>${esc(h)}</h2><p>${esc(p)}</p>`).join('')}
    </div>
  </div>`;
  screen.querySelectorAll('[data-doc]').forEach((b) => b.addEventListener('click', () => { active = b.dataset.doc; render(); }));
}

render();
