/**
 * Faberlic — Ko'rilgan mahsulotlar
 * Mijoz yaqinda ochgan mahsulotlar (mahsulot sahifasida yoziladi), eng yangisi birinchi.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { dataService } from '../core/store.js';
import { toast } from '../core/ui.js';
import { pageHeader, productCard, bindWishButtons, bindThemeToggle } from '../components.js';

bootstrap();

const NS = config.data.persistNamespace;
const KEY = `${NS}:recentlyViewed`;
const screen = document.getElementById('screen');

async function render() {
  const ids = JSON.parse(localStorage.getItem(KEY) || '[]');
  const all = await dataService.getProducts();
  const items = ids.map((id) => all.find((p) => p.id === id)).filter(Boolean);

  document.getElementById('appbar').innerHTML = pageHeader({
    title: "Ko'rilganlar", subtitle: `${items.length} ta mahsulot`, back: 'profile.html',
    action: items.length ? `<button class="hbtn" id="clearBtn" aria-label="Tozalash">${icon('trash', { size: 22 })}</button>` : '',
  });
  bindThemeToggle();

  screen.innerHTML = items.length
    ? `<div class="pcard-grid" style="padding-top:16px">${items.map(productCard).join('')}</div>`
    : `<div class="empty-state" style="padding-top:60px"><div class="empty-state__emoji">👀</div>
        <h3>Hali hech narsa ko'rilmagan</h3><p>Siz ochgan mahsulotlar shu yerda ko'rinadi.</p>
        <a class="btn" href="catalog.html">${t('nav.catalog')}</a></div>`;

  bindWishButtons(screen, (_, w) => toast(w ? "❤️ Sevimlilarga qo'shildi" : 'Sevimlilardan olib tashlandi'));
  document.getElementById('clearBtn')?.addEventListener('click', () => { localStorage.removeItem(KEY); toast('Tarix tozalandi'); render(); });
}

render();
