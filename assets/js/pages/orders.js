/**
 * Faberlic — Buyurtmalar tarixi
 * Statistika, holat bo'yicha filtr va buyurtma kartalari.
 */
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { formatPrice, formatDate } from '../core/format.js';
import { dataService } from '../core/store.js';
import { esc } from '../core/ui.js';
import { tabBar, bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
const TABS = [['all', 'Barchasi'], ['active', 'Faol'], ['delivered', 'Yetkazilgan'], ['cancelled', 'Bekor qilingan']];
const ACTIVE = ['pending', 'paid', 'processing', 'shipped'];
let filter = 'all';

function stats(orders) {
  const completed = orders.filter((o) => o.status === 'delivered').length;
  const transit = orders.filter((o) => o.status === 'shipped').length;
  const processing = orders.filter((o) => ['pending', 'paid', 'processing'].includes(o.status)).length;
  const spent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const card = (cls, ic, num, label) => `<div class="stat-card">
    <span class="stat-icon ${cls}">${ic}</span>
    <span class="stat-info"><span class="stat-number">${num}</span><span class="stat-label">${label}</span></span></div>`;
  return `<div class="stats-grid">
    ${card('completed', '📦', completed, 'Yetkazilgan')}
    ${card('processing', '🚚', transit, "Yo'lda")}
    ${card('pending', '⏳', processing, 'Jarayonda')}
    ${card('total', '💰', formatPrice(spent), 'Jami xarid')}
  </div>`;
}

function orderCard(o) {
  const items = o.items || [];
  const preview = items.slice(0, 3);
  const remaining = Math.max(0, items.length - 3);
  const imgs = preview.map((it) => it.image
    ? `<img class="item-image" src="${encodeURI(it.image)}" alt="${esc(it.name)}" data-emoji="${it.emoji || ''}" data-color="${it.color || ''}">`
    : `<span class="item-image">${it.emoji || '🌸'}</span>`).join('');
  return `<div class="order-item" data-id="${o.id}">
    <div class="order-header">
      <div class="order-info"><div class="order-id">${esc(o.number)}</div>
        <div class="order-date">${formatDate(o.createdAt)}</div></div>
      <div class="order-status ${o.status}">${t('order.status.' + o.status)}</div>
    </div>
    <div class="order-items-preview">
      <div class="item-images">${imgs}${remaining ? `<span class="item-image more">+${remaining}</span>` : ''}</div>
      <div class="items-summary">
        <div class="items-count">${items.reduce((n, i) => n + (i.qty || 1), 0)} ta mahsulot</div>
        <div class="items-preview">${esc(items.map((i) => i.name).join(', '))}</div>
      </div>
    </div>
    <div class="order-footer">
      <div class="order-total">${formatPrice(o.total)}</div>
      <div class="order-actions"><span class="btn btn--ghost btn--sm">Ko'rish ${icon('chevron', { size: 16 })}</span></div>
    </div>
  </div>`;
}

function render() {
  const all = dataService.getOrders();
  const list = all.filter((o) => filter === 'all' ? true
    : filter === 'active' ? ACTIVE.includes(o.status) : o.status === filter);

  document.getElementById('appbar').innerHTML = `
    <header class="orders-header"><div class="header-top">
      <a class="back-button" href="index.html" aria-label="Orqaga">${icon('back', { size: 24 })}</a>
      <div class="header-center"><h1 class="page-title">${t('orders.title')}</h1>
        <span class="order-count">${all.length} ta buyurtma</span></div>
      <span class="filter-button" style="visibility:hidden">${icon('filter', { size: 24 })}</span>
    </div></header>`;

  screen.innerHTML = `<div class="orders-content">
    ${stats(all)}
    <div class="filter-tabs">
      ${TABS.map(([id, label]) => `<button class="filter-tab${id === filter ? ' active' : ''}" data-tab="${id}">${label}</button>`).join('')}
    </div>
    ${list.length ? `<div class="orders-list">${list.map(orderCard).join('')}</div>`
      : `<div class="empty-orders"><div class="empty-icon">📦</div>
          <h3 class="empty-title">${t('orders.empty')}</h3><p>Xarid qiling — buyurtmalaringiz shu yerda ko'rinadi.</p>
          <a class="btn" href="catalog.html" style="margin-top:12px">${t('nav.catalog')}</a></div>`}
  </div>`;

  document.getElementById('tabbar').innerHTML = tabBar('orders');
  bindThemeToggle();

  screen.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.tab; render(); }));
  screen.querySelectorAll('[data-id]').forEach((c) => c.addEventListener('click', () => { location.href = `order.html?id=${encodeURIComponent(c.dataset.id)}`; }));
}

render();
