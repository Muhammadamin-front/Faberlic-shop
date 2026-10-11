/**
 * Faberlic — Katalog
 * Sarlavha, kategoriya va tur chiplari, saralash,
 * mahsulot kartalari va filtr oynasi (narx / mavjudlik).
 */
import { bootstrap } from '../app.js';
import { icon } from '../core/icons.js';
import { formatPrice } from '../core/format.js';
import { dataService } from '../core/store.js';
import { esc, productImage, toast, bottomSheet } from '../core/ui.js';
import { tabBar, bindThemeToggle, askPriceButton, bindAskButtons } from '../components.js';
import { config } from '../config.js';
import { hasPrice } from '../data/catalog.js';

bootstrap();

const MAX_PRICE = 500000;
const params = new URLSearchParams(location.search);
const state = {
  type: params.get('type') || 'all',
  category: params.get('category') || 'all',
  subcategory: params.get('subcategory') || 'all',
  sort: params.get('sort') || 'newest',
  filters: { maxPrice: MAX_PRICE, rating: 0, inStock: true, outOfStock: true },
};

const screen = document.getElementById('screen');
let categories = [];

const SORT_MAP = { newest: 'newest', oldest: 'newest', 'price-low': 'price-asc', 'price-high': 'price-desc', rating: 'rating', popular: 'rating' };

function stars(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => `<span class="star${i < full ? ' filled' : ''}">★</span>`).join('');
}

function productCard(p) {
  const discount = hasPrice(p) && p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
  return `<div class="product-card" data-id="${p.id}">
    <div class="product-image-container">
      <img class="product-image" src="${productImage(p)}" alt="${esc(p.name)}" loading="lazy" data-emoji="${p.emoji || ''}" data-color="${p.color || ''}">
      ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
      ${!p.inStock ? '<div class="out-of-stock-overlay">Tugagan</div>' : ''}
    </div>
    <div class="product-info">
      <h3 class="product-name">${esc(p.name)}</h3>
      ${p.volume ? `<div class="product-volume">${esc(p.volume)} · ${esc(p.skinType || '')}</div>` : ''}
      ${config.features.ratings && p.rating ? `<div class="product-rating">
        <div class="rating-stars">${stars(p.rating)}</div>
        <span class="rating-text">${p.rating} (${p.reviewCount})</span>
      </div>` : ''}
      <div class="product-price">
        ${hasPrice(p) ? `<span class="current-price">${formatPrice(p.price)}</span>
        ${p.compareAtPrice ? `<span class="original-price">${formatPrice(p.compareAtPrice)}</span>` : ''}` : askPriceButton(p.id)}
      </div>
      <div class="product-availability">
        ${p.inStock ? '<span class="in-stock">✓ Mavjud</span>' : '<span class="out-of-stock">✗ Tugagan</span>'}
        ${p.inStock && p.stock <= 20 ? `<span class="stock-count">${p.stock} ta qoldi</span>` : ''}
      </div>
    </div>
  </div>`;
}

function subcatBar() {
  const cat = categories.find((c) => c.id === state.category);
  if (!cat || !cat.subcategories?.length) return '';
  return `<div class="subcategory-filter">
    <div class="subcategory-title">Turi:</div>
    <div class="subcategory-scroll">
      <button class="subcategory-chip${state.subcategory === 'all' ? ' active' : ''}" data-sub="all">Barchasi</button>
      ${cat.subcategories.map((s) => `<button class="subcategory-chip${state.subcategory === s.id ? ' active' : ''}" data-sub="${s.id}">${esc(s.name)}</button>`).join('')}
    </div>
  </div>`;
}

async function render() {
  const products = await dataService.getProducts({
    category: state.category,
    subcategory: state.subcategory, sort: SORT_MAP[state.sort],
  });
  const list = products.filter((p) => (p.inStock || state.filters.outOfStock)
    && (!hasPrice(p) || p.price <= state.filters.maxPrice));

  document.getElementById('appbar').innerHTML = `
    <header class="products-header"><div class="header-top">
      <a class="back-button" href="index.html" aria-label="Orqaga">${icon('back', { size: 24 })}</a>
      <div class="header-center"><h1 class="page-title">Katalog</h1>
        <span class="product-count">${list.length} ta mahsulot</span></div>
      <button class="filter-button" id="filterBtn" aria-label="Filtr">${icon('filter', { size: 24 })}</button>
    </div></header>`;

  screen.innerHTML = `
    <div class="products-content">
      <div class="category-filter"><div class="category-scroll">
        <button class="category-chip${state.category === 'all' ? ' active' : ''}" data-cat="all">Barchasi</button>
        ${categories.map((c) => `<button class="category-chip${state.category === c.id ? ' active' : ''}" data-cat="${c.id}">${c.icon} ${esc(c.name)}</button>`).join('')}
      </div></div>

      ${subcatBar()}

      <div class="sort-section">
        <span class="results-count">${list.length} ta mahsulot</span>
        <select class="sort-select" id="sortSelect">
          ${[['newest', 'Yangilari'], ['price-low', 'Arzonroq'], ['price-high', 'Qimmatroq'], ['popular', 'Ommabop']]
            .map(([v, l]) => `<option value="${v}" ${state.sort === v ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>

      ${list.length ? `<div class="products-grid">${list.map(productCard).join('')}</div>`
        : `<div class="empty-products"><div class="empty-icon">🌸</div>
            <h3 class="empty-title">Mahsulot topilmadi</h3>
            <p>Filtrlarni o'zgartirib ko'ring.</p></div>`}
    </div>`;

  document.getElementById('tabbar').innerHTML = tabBar('catalog');
  bindThemeToggle();
  wire();
}

function wire() {
  screen.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => { state.category = b.dataset.cat; state.subcategory = 'all'; render(); }));
  screen.querySelectorAll('[data-sub]').forEach((b) => b.addEventListener('click', () => { state.subcategory = b.dataset.sub; render(); }));
  screen.querySelectorAll('[data-id]').forEach((c) => c.addEventListener('click', () => { location.href = `product.html?id=${encodeURIComponent(c.dataset.id)}`; }));
  document.getElementById('sortSelect')?.addEventListener('change', (e) => { state.sort = e.target.value; render(); });
  document.getElementById('filterBtn')?.addEventListener('click', openFilters);
  bindAskButtons(screen);
}

function openFilters() {
  const f = state.filters;
  const form = `
    <div class="field"><label class="field__label">Narxi: <span id="pv">${formatPrice(f.maxPrice)}</span></label>
      <input type="range" id="pmax" min="0" max="${MAX_PRICE}" step="5000" value="${f.maxPrice}" style="width:100%;accent-color:var(--accent)"></div>
    <div class="list-row" style="border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:16px">
      <span class="list-row__text"><span class="list-row__title">Tugaganlarni ham ko'rsatish</span></span>
      <label class="switch"><input type="checkbox" id="oos" ${f.outOfStock ? 'checked' : ''}><span class="switch__track"></span></label>
    </div>
    <button class="btn btn--block" id="applyF">Filtrni qo'llash</button>`;
  const sheet = bottomSheet({ title: 'Filtr', content: form });
  const pmax = sheet.el.querySelector('#pmax');
  pmax.addEventListener('input', () => { sheet.el.querySelector('#pv').textContent = formatPrice(pmax.value); });
  sheet.el.querySelector('#applyF').addEventListener('click', () => {
    f.maxPrice = +pmax.value; f.outOfStock = sheet.el.querySelector('#oos').checked;
    sheet.close(); toast('Filtr qo\'llandi'); render();
  });
}

(async function init() { categories = await dataService.getCategories(); render(); })();
