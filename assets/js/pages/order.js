/**
 * Faberlic — Buyurtma tafsilotlari
 * Holat kartasi, Tafsilotlar / Kuzatish / Chek bo'limlari, qayta buyurtma.
 */
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { config } from '../config.js';
import { formatPrice, formatDate, formatDateTime } from '../core/format.js';
import { dataService } from '../core/store.js';
import { esc, placeholder, toast } from '../core/ui.js';
import { haptic } from '../core/telegram.js';
import { bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
const id = new URLSearchParams(location.search).get('id');
const order = dataService.getOrders().find((o) => o.id === id);

const FLOW = ['pending', 'paid', 'shipped', 'delivered'];
const STATUS_META = {
  pending:   { icon: '⏳', text: 'Buyurtma qabul qilindi', desc: "Operatorimiz tez orada siz bilan bog'lanib, buyurtmani tasdiqlaydi." },
  paid:      { icon: '📦', text: 'Tasdiqlandi', desc: 'Buyurtmangiz tasdiqlandi va tayyorlanmoqda.' },
  processing:{ icon: '📦', text: 'Tayyorlanmoqda', desc: 'Buyurtmangiz yig\'ilmoqda.' },
  shipped:   { icon: '🚚', text: "Yo'lda", desc: "Kuryer buyurtmangizni olib kelmoqda." },
  delivered: { icon: '✅', text: 'Yetkazildi', desc: 'Buyurtmangiz yetkazildi. Xaridingiz uchun rahmat!' },
  cancelled: { icon: '❌', text: 'Bekor qilindi', desc: 'Bu buyurtma bekor qilingan.' },
};
const TIMELINE = [
  { status: 'pending', title: 'Buyurtma berildi', desc: 'Buyurtmangizni qabul qildik.' },
  { status: 'paid', title: 'Tasdiqlandi', desc: "Operator tasdiqladi, mahsulotlar tayyorlanmoqda." },
  { status: 'shipped', title: "Yo'lga chiqdi", desc: 'Buyurtma kuryerga topshirildi.' },
  { status: 'delivered', title: 'Yetkazildi', desc: 'Buyurtma manzilingizga yetkazildi.' },
];

let activeTab = 'details';

function itemImage(it) {
  return it.image ? encodeURI(it.image) : placeholder(it.emoji || '🌸', it.color || '#F48FB1', 120, 120);
}

function detailsTab() {
  const a = order.address || {};
  return `<div class="tab-panel ${activeTab === 'details' ? 'active' : ''}" id="detailsTab">
    <div class="section"><h3 class="section-title">Buyurtma qilingan mahsulotlar</h3>
      <div class="order-items">
        ${(order.items || []).map((it) => `<div class="order-item">
          <img class="item-image" src="${itemImage(it)}" alt="${esc(it.name)}" data-emoji="${it.emoji || ''}" data-color="${it.color || ''}">
          <div class="item-details"><div class="item-name">${esc(it.name)}</div>
            <div class="item-quantity">${it.meta?.variant ? `${esc(it.meta.variant)} · ` : ''}Soni: ${it.qty}</div></div>
          <div class="item-price">${formatPrice(it.price * it.qty)}</div>
        </div>`).join('')}
      </div>
    </div>
    <div class="section"><h3 class="section-title">Yetkazib berish</h3>
      <div class="info-card">
        <div class="info-row"><span class="info-label">Ism</span><span class="info-value">${esc(a.name || '—')}</span></div>
        <div class="info-row"><span class="info-label">Telefon</span><span class="info-value">${esc(a.phone || '—')}</span></div>
        <div class="info-row"><span class="info-label">Manzil</span><span class="info-value">${[a.line1, a.line2, [a.city, a.region].filter(Boolean).join(', '), a.postal, a.country].filter(Boolean).map(esc).join('<br>') || '—'}</span></div>
        <div class="info-row"><span class="info-label">Usul</span><span class="info-value">${esc(order.shippingMethod || 'Standart')}</span></div>
      </div>
    </div>
    <div class="section"><h3 class="section-title">To'lov usuli</h3>
      <div class="payment-card"><div class="payment-icon">💳</div>
        <div class="payment-info"><div class="payment-method">${esc(order.paymentMethod || '—')}</div>
          <div class="payment-status">${order.status === 'cancelled' ? 'Bekor qilingan' : order.paymentStatus === 'paid' ? "To'langan" : "Yetkazib berilganda / operator orqali"}</div></div>
      </div>
    </div>
  </div>`;
}

function trackingTab() {
  const reached = FLOW.indexOf(order.status);
  return `<div class="tab-panel ${activeTab === 'tracking' ? 'active' : ''}" id="trackingTab">
    <div class="tracking-timeline">
      ${TIMELINE.map((step) => {
        const idx = FLOW.indexOf(step.status);
        const cls = idx < reached ? 'completed' : idx === reached ? 'current' : '';
        return `<div class="timeline-item ${cls}">
          <div class="timeline-dot">${idx < reached ? '✓' : idx + 1}</div>
          <div class="timeline-content"><div class="timeline-title">${step.title}</div>
            <div class="timeline-description">${step.desc}</div>
            <div class="timeline-time">${idx === 0 ? formatDateTime(order.createdAt) : idx <= reached ? '✓' : 'Kutilmoqda'}</div></div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function receiptTab() {
  const rows = [
    [t('cart.subtotal'), order.subtotal ?? order.total],
    order.discount ? [t('cart.discount'), -order.discount] : null,
    [t('cart.shipping'), order.shipping || 0],
    order.tax ? [t('cart.tax'), order.tax] : null,
  ].filter(Boolean);
  return `<div class="tab-panel ${activeTab === 'receipt' ? 'active' : ''}" id="receiptTab">
    <div class="receipt-container">
      <div class="receipt-header"><div class="receipt-title">${esc(config.brand.name)} · ${esc(order.number)}</div>
        <div class="receipt-date">${formatDate(order.createdAt)}</div></div>
      <div class="receipt-items">
        ${(order.items || []).map((it) => `<div class="receipt-item">
          <span class="receipt-item-name">${esc(it.name)}</span>
          <span class="receipt-item-qty">×${it.qty}</span>
          <span class="receipt-item-price">${formatPrice(it.price * it.qty)}</span>
        </div>`).join('')}
      </div>
      <div class="receipt-summary">
        ${rows.map(([label, val]) => `<div class="summary-row"><span class="summary-label">${label}</span>
          <span class="summary-value">${val < 0 ? '-' : ''}${formatPrice(Math.abs(val))}</span></div>`).join('')}
        <div class="summary-row total"><span class="summary-label">${t('cart.total')}</span><span class="summary-value">${formatPrice(order.total)}</span></div>
      </div>
    </div>
  </div>`;
}

function reorder() {
  (order.items || []).forEach((it) => dataService.addToCart({
    productId: it.productId || it.name, variantId: null, name: it.name, price: it.price,
    type: it.type || 'physical', qty: it.qty, image: it.image || null, emoji: it.emoji, color: it.color, meta: it.meta || {},
  }));
  haptic('success'); toast("Mahsulotlar savatga qo'shildi", { kind: 'success' });
  setTimeout(() => { location.href = 'cart.html'; }, 600);
}

function render() {
  if (!order) {
    document.getElementById('appbar').innerHTML = header('Buyurtma');
    screen.innerHTML = `<div class="order-content"><div class="empty-state"><div class="empty-state__emoji">❌</div>
      <h3>Buyurtma topilmadi</h3><p>Bunday buyurtma mavjud emas.</p>
      <a class="btn" href="orders.html">${t('orders.title')}</a></div></div>`;
    return;
  }
  const meta = STATUS_META[order.status] || STATUS_META.paid;

  document.getElementById('appbar').innerHTML = header(order.number);
  bindThemeToggle();

  screen.innerHTML = `<div class="order-content">
    <div class="status-card">
      <div class="status-icon">${meta.icon}</div>
      <div class="status-info"><div class="status-text">${meta.text}</div>
        <div class="status-description">${meta.desc}</div>
        ${order.status === 'shipped' || order.status === 'paid'
          ? `<div class="estimated-delivery">Taxminiy yetkazish: ${estDelivery()}</div>` : ''}
      </div>
    </div>
    <div class="tab-navigation">
      ${[['details', 'Tafsilotlar'], ['tracking', 'Kuzatish'], ['receipt', 'Chek']].map(([k, l]) =>
        `<button class="tab-button ${activeTab === k ? 'active' : ''}" data-tab="${k}">${l}</button>`).join('')}
    </div>
    <div class="tab-content">${detailsTab()}${trackingTab()}${receiptTab()}</div>
  </div>`;

  document.getElementById('bottombar').innerHTML = `<div class="bottom-actions">
    <button class="action-btn secondary" id="reorderBtn">Qayta buyurtma</button>
    <button class="action-btn primary" id="contactBtn">Operator bilan bog'lanish</button>
  </div>`;

  wire();
}

function estDelivery() {
  const d = new Date(order.createdAt); d.setDate(d.getDate() + 2);
  return formatDate(d);
}

function header(title) {
  return `<header class="order-view-header"><div class="header-top">
    <a class="back-button" href="orders.html" aria-label="Orqaga">${icon('back', { size: 24 })}</a>
    <div class="header-center"><h1 class="page-title">Buyurtma</h1>
      <span class="order-id">${esc(title)}</span></div>
    <button class="share-button" id="shareBtn" aria-label="Ulashish">${icon('send', { size: 22 })}</button>
  </div></header>`;
}

function wire() {
  screen.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => {
    activeTab = b.dataset.tab;
    screen.querySelectorAll('.tab-button').forEach((x) => x.classList.toggle('active', x === b));
    screen.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === activeTab + 'Tab'));
    haptic('selection');
  }));
  document.getElementById('reorderBtn').addEventListener('click', reorder);
  document.getElementById('contactBtn').addEventListener('click', () => {
    const user = String(config.brand.telegram || '').replace('@', '');
    if (!user) { location.href = `tel:${(config.brand.phone || '').replace(/\s/g, '')}`; return; }
    const url = `https://t.me/${user}?text=${encodeURIComponent(`Assalomu alaykum! Buyurtmam: ${order.number}`)}`;
    const tg = window.Telegram?.WebApp;
    if (tg?.openTelegramLink && tg.initData) tg.openTelegramLink(url); else window.open(url, '_blank', 'noopener');
  });
  document.getElementById('shareBtn')?.addEventListener('click', () => {
    const text = `${config.brand.name}: buyurtma ${order.number} — ${formatPrice(order.total)}`;
    if (navigator.share) navigator.share({ text }).catch(() => {}); else { navigator.clipboard?.writeText(text); toast('Nusxalandi'); }
  });
}

render();
