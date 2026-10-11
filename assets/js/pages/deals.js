/**
 * Faberlic — Chegirmalar
 * Eski narxi (compareAtPrice) ko'rsatilgan mahsulotlar — eng katta chegirma birinchi.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { dataService } from '../core/store.js';
import { esc, toast } from '../core/ui.js';
import { pageHeader, productCard, bindWishButtons, bindThemeToggle } from '../components.js';
import { hasPrice } from '../data/catalog.js';

bootstrap();

const screen = document.getElementById('screen');
const off = (p) => 1 - p.price / p.compareAtPrice;

async function render() {
  const all = await dataService.getProducts();
  const deals = all.filter((p) => hasPrice(p) && p.compareAtPrice).sort((a, b) => off(b) - off(a));
  const promo = Object.entries(config.commerce.promoCodes || {})[0];

  document.getElementById('appbar').innerHTML = pageHeader({ title: 'Chegirmalar', subtitle: 'Maxsus takliflar', back: 'index.html' });
  bindThemeToggle();

  const topOff = deals.length ? Math.max(...deals.map(off)) : 0;

  screen.innerHTML = `
    <div class="deals-hero"><h2>🌷 Chegirmalar</h2>
      <p>${deals.length ? `${Math.round(topOff * 100)}% gacha chegirma` : 'Tez orada yangi aksiyalar'}</p>
      ${promo ? `<p style="margin-top:6px">Promo-kod: <b>${esc(promo[0])}</b> — ${esc(promo[1].label)}</p>` : ''}
    </div>
    ${deals.length ? `<div class="pcard-grid" style="padding-top:8px">${deals.map(productCard).join('')}</div>`
      : `<div class="empty-state"><div class="empty-state__emoji">🏷️</div><h3>Hozircha chegirmalar yo'q</h3>
          <a class="btn" href="catalog.html">${t('nav.catalog')}</a></div>`}
    <div style="height:24px"></div>`;

  bindWishButtons(screen, (_, w) => toast(w ? "❤️ Sevimlilarga qo'shildi" : 'Sevimlilardan olib tashlandi'));
}

render();
