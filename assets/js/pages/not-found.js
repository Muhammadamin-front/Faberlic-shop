/**
 * Faberlic — 404 sahifa
 * Mavjud bo'lmagan sahifa uchun.
 */
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { appBar, bindThemeToggle } from '../components.js';

bootstrap();

document.getElementById('appbar').innerHTML = appBar({ title: '', back: 'index.html', themeToggle: true });
bindThemeToggle();

document.getElementById('screen').innerHTML = `
  <div class="empty-state" style="min-height:70dvh;justify-content:center">
    <div class="empty-state__emoji" style="font-size:64px">🧭</div>
    <h3>Sahifa topilmadi</h3>
    <p>Siz qidirgan sahifa mavjud emas yoki ko'chirilgan.</p>
    <a class="btn" href="index.html">${t('nav.home')}</a>
  </div>`;
