/**
 * Faberlic — Biz bilan bog'lanish
 * Telegram, telefon va manzil. Telegram ichida chat to'g'ridan-to'g'ri ochiladi.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { icon } from '../core/icons.js';
import { esc } from '../core/ui.js';
import { pageHeader, bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
const { telegram, phone, city, supportUrl } = config.brand;
const tgUser = String(telegram || '').replace('@', '').trim();

document.getElementById('appbar').innerHTML = pageHeader({ title: "Bog'lanish", subtitle: 'Savollaringizga javob beramiz', back: 'profile.html' });
bindThemeToggle();

function row(ic, title, value, attrs) {
  return `<a class="list-row" ${attrs}>
    <span class="list-row__icon">${ic}</span>
    <span class="list-row__text"><span class="list-row__title">${esc(title)}</span>
      <span class="list-row__sub">${esc(value)}</span></span>
    ${icon('chevron', { size: 18, cls: 'text-faint' })}</a>`;
}

screen.innerHTML = `<div class="extra-content">
  <div class="about" style="padding-top:8px">
    <div class="about__logo">💬</div>
    <p class="muted" style="margin-top:8px">Buyurtma, mahsulot yoki narx haqida savollaringiz bo'lsa — yozing yoki qo'ng'iroq qiling.</p>
  </div>
  <div class="list">
    ${tgUser ? row(icon('send', { size: 20 }), 'Telegram orqali yozish', '@' + tgUser, `href="https://t.me/${encodeURIComponent(tgUser)}" data-tg`) : ''}
    ${phone ? row(icon('help', { size: 20 }), "Qo'ng'iroq qilish", phone, `href="tel:${esc(phone.replace(/\s/g, ''))}"`) : ''}
    ${supportUrl ? row(icon('globe', { size: 20 }), 'Kanalimiz', supportUrl, `href="${esc(supportUrl)}" target="_blank" rel="noopener"`) : ''}
    ${city ? `<div class="list-row"><span class="list-row__icon">${icon('map', { size: 20 })}</span>
      <span class="list-row__text"><span class="list-row__title">Manzil</span><span class="list-row__sub">${esc(city)}</span></span></div>` : ''}
  </div>
</div>`;

screen.querySelector('[data-tg]')?.addEventListener('click', (e) => {
  const tg = window.Telegram?.WebApp;
  if (tg?.openTelegramLink && tg.initData) { e.preventDefault(); tg.openTelegramLink(e.currentTarget.href); }
});
