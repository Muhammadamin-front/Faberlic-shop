/**
 * Faberlic — Sevimlilar
 * Kategoriya filtri, saralash, mahsulotlar va tanlash rejimi (savatga / o'chirish).
 */
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { dataService } from '../core/store.js';
import { toast } from '../core/ui.js';
import { hasPrice } from '../data/catalog.js';
import { haptic } from '../core/telegram.js';
import { tabBar, productCard, bindWishButtons, bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
let all = [];
let filter = 'all';
let categories = [];
let sort = 'newest';
let editMode = false;
const selected = new Set();

function list() {
  const ids = dataService.getWishlist();
  let items = all.filter((p) => ids.includes(p.id));
  if (filter !== 'all') items = items.filter((p) => p.categoryId === filter);
  if (sort === 'price-low') items.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  else if (sort === 'price-high') items.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
  return items;
}

function render() {
  const items = list();

  document.getElementById('appbar').innerHTML = `<header class="favorites-header"><div class="header-top">
    <span style="width:44px"></span>
    <div class="header-center"><h1 class="page-title">${t('nav.wishlist')}</h1>
      <span class="favorites-subtitle">${items.length} ta mahsulot</span></div>
    ${items.length ? `<button class="edit-button" id="editBtn">${editMode ? 'Tayyor' : 'Tanlash'}</button>` : '<span style="width:44px"></span>'}
  </div></header>`;
  bindThemeToggle();

  if (!items.length) {
    screen.innerHTML = `<div class="empty-state" style="padding-top:60px">
      <div class="empty-state__emoji">🤍</div><h3>Sevimlilar ro'yxati bo'sh</h3>
      <p>Mahsulotdagi ❤️ belgisini bosing — u shu yerda saqlanadi.</p>
      <a class="btn" href="catalog.html">${t('nav.catalog')}</a></div>`;
    document.getElementById('tabbar').innerHTML = tabBar('wishlist');
    document.getElementById('bottombar') && (document.getElementById('bottombar').innerHTML = '');
    return;
  }

  screen.innerHTML = `<div class="favorites-content">
    <div class="filter-tabs">
      ${[['all', 'Barchasi'], ...categories.filter((c) => all.some((p) => p.categoryId === c.id && dataService.isWished(p.id))).map((c) => [c.id, c.name])].map(([id, l]) =>
        `<button class="filter-tab${filter === id ? ' active' : ''}" data-filter="${id}">${l}</button>`).join('')}
    </div>
    <div class="sort-section"><span class="results-count">${items.length} ta</span>
      <select class="sort-select" id="sortSel">
        ${[['newest', 'Yangilari'], ['price-low', 'Arzonroq'], ['price-high', 'Qimmatroq']]
          .map(([v, l]) => `<option value="${v}" ${sort === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select></div>
    <div class="favorites-grid">
      ${items.map((p) => {
        const cardHtml = productCard(p);
        return editMode
          ? cardHtml.replace('<div class="pcard__media">', `<div class="pcard__media"><span class="fav-check">${selected.has(p.id) ? icon('check', { size: 14 }) : ''}</span>`)
              .replace('class="pcard"', `class="pcard${selected.has(p.id) ? ' is-selected' : ''}" data-sel="${p.id}"`)
          : cardHtml;
      }).join('')}
    </div>
  </div>`;

  document.getElementById('tabbar').innerHTML = tabBar('wishlist');
  document.getElementById('bottombar') && (document.getElementById('bottombar').innerHTML = editMode ? bulkBar() : '');
  wire();
}

function bulkBar() {
  return `<div class="bulk-actions">
    <span class="bulk-info">${selected.size} ta tanlandi</span>
    <div class="bulk-buttons">
      <button class="btn btn--sm btn--ghost" id="bulkCart">${icon('cart', { size: 16 })} Savatga</button>
      <button class="btn btn--sm btn--outline" id="bulkRemove" style="color:var(--danger);border-color:var(--danger)">O'chirish</button>
    </div>
  </div>`;
}

function wire() {
  document.getElementById('editBtn')?.addEventListener('click', () => { editMode = !editMode; selected.clear(); render(); });
  document.getElementById('sortSel')?.addEventListener('change', (e) => { sort = e.target.value; render(); });
  screen.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.filter; render(); }));

  if (editMode) {
    screen.querySelectorAll('[data-sel]').forEach((c) => c.addEventListener('click', (e) => {
      e.preventDefault();
      const id = c.dataset.sel;
      if (selected.has(id)) selected.delete(id); else selected.add(id);
      render();
    }));
    document.getElementById('bulkRemove')?.addEventListener('click', () => {
      selected.forEach((id) => dataService.toggleWishlist(id));
      haptic('medium'); toast(`${selected.size} ta o'chirildi`); selected.clear(); editMode = false; render();
    });
    document.getElementById('bulkCart')?.addEventListener('click', () => {
      const items = all.filter((p) => selected.has(p.id) && hasPrice(p) && p.inStock);
      items.forEach((p) => dataService.addToCart({ productId: p.id, variantId: null, name: p.name, price: p.price, type: p.type, image: p.image || null, emoji: p.emoji, color: p.color }));
      haptic('success'); toast(`${items.length} ta mahsulot savatga qo'shildi`, { kind: 'success' }); selected.clear(); editMode = false; render();
    });
  } else {
    bindWishButtons(screen, (_, wished) => { if (!wished) { toast('Sevimlilardan olib tashlandi'); render(); } });
  }
}

(async function init() {
  [all, categories] = await Promise.all([dataService.getProducts(), dataService.getCategories()]);
  render();
})();
