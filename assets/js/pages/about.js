/**
 * Faberlic — Biz haqimizda
 * Do'kon haqida qisqacha ma'lumot va foydali havolalar. Hammasi config.js dan olinadi.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { esc } from '../core/ui.js';
import { appBar, bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');

document.getElementById('appbar').innerHTML = appBar({ title: t('profile.about'), back: 'profile.html', themeToggle: true });
bindThemeToggle();

const link = (href, ic, title) => `<a class="list-row" href="${href}"><span class="list-row__icon">${icon(ic, { size: 20 })}</span>
  <span class="list-row__text"><span class="list-row__title">${title}</span></span>${icon('chevron', { size: 18, cls: 'text-faint' })}</a>`;

screen.innerHTML = `
  <div class="about">
    <div class="about__logo">${config.brand.logoSvg || config.brand.logoEmoji}</div>
    <h1 style="margin-top:8px">${esc(config.brand.name)}</h1>
    <p class="muted">${esc(config.brand.tagline)}</p>
    <p class="muted text-sm" style="margin-top:12px;line-height:1.5">Faberlic kompaniyasining original kosmetika va parvarish mahsulotlari.
      Buyurtmani shu ilova orqali bering — biz ${esc(config.brand.city)} va butun O'zbekiston bo'ylab yetkazib beramiz.</p>
  </div>
  <div class="list">
    ${link('help.html', 'help', "Savol-javoblar")}
    ${link('support.html', 'send', "Biz bilan bog'lanish")}
    ${link('legal.html', 'info', 'Shartlar va maxfiylik')}
  </div>
`;
