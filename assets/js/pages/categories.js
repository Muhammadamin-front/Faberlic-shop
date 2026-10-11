/**
 * Faberlic — Kategoriyalar
 * Tavsiya etilgan kategoriyalar to'ri va to'liq ro'yxat; har biri katalogga olib boradi.
 */
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { dataService } from '../core/store.js';
import { esc } from '../core/ui.js';
import { bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
const TINTS = ['tint-pink', 'tint-purple', 'tint-blue', 'tint-green', 'tint-orange', 'tint-red'];
const GRADS = ['linear-gradient(135deg,#F06595,#C2255C)', 'linear-gradient(135deg,#B197FC,#7048E8)',
  'linear-gradient(135deg,#74C0FC,#1C7ED6)', 'linear-gradient(135deg,#63E6BE,#0CA678)'];
let categories = [];

function card(c, i) {
  const total = (c.subcategories || []).reduce((n, s) => n + (s.count || 0), 0);
  return `<a class="category-card" href="catalog.html?category=${c.id}">
    <span class="category-image ${TINTS[i % TINTS.length]}">${c.icon}</span>
    <span class="category-info">
      <span class="category-name">${esc(c.name)}</span>
      <span class="category-count">${total} ta mahsulot · ${(c.subcategories || []).map((s) => esc(s.name)).join(', ')}</span>
    </span>
    <span class="category-arrow">›</span>
  </a>`;
}

function render() {
  const list = categories;
  const featured = categories.slice(0, 4);

  document.getElementById('appbar').innerHTML = `<header class="categories-header"><div class="header-top">
    <a class="back-button" href="index.html" aria-label="Orqaga">${icon('back', { size: 24 })}</a>
    <div class="header-center"><h1 class="page-title">${t('home.categories')}</h1></div>
    <a class="search-button" href="search.html" aria-label="Qidiruv">${icon('search', { size: 22 })}</a>
  </div></header>`;
  bindThemeToggle();

  screen.innerHTML = `<div class="categories-content">
    <div class="featured-section"><h3 class="section-title">Ommabop</h3>
      <div class="featured-grid">
        ${featured.map((c, i) => `<a class="featured-category" href="catalog.html?category=${c.id}" style="background:${GRADS[i % GRADS.length]}">
          <span class="featured-category__icon">${c.icon}</span>
          <span><span class="featured-category__name">${esc(c.name)}</span><br>
            <span class="featured-category__count">${(c.subcategories || []).reduce((n, s) => n + (s.count || 0), 0)} ta mahsulot</span></span>
        </a>`).join('')}
      </div></div>

    <div class="categories-section"><h3 class="section-title">Barcha kategoriyalar</h3>
      <div class="categories-list">${list.map(card).join('')}</div>
    </div>
  </div>`;

}

(async function init() { categories = await dataService.getCategories(); render(); })();
