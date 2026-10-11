/**
 * Faberlic — Buyurtmani kuzatish
 * Buyurtma raqami bo'yicha holat va bosqichlarni ko'rsatadi (shu qurilmadagi buyurtmalar).
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { icon } from '../core/icons.js';
import { formatPrice, formatDate } from '../core/format.js';
import { dataService } from '../core/store.js';
import { esc, toast } from '../core/ui.js';
import { haptic } from '../core/telegram.js';
import { bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
const FLOW = ['pending', 'paid', 'shipped', 'delivered'];
const STATUS = {
  pending: '⏳ Qabul qilindi', paid: '📦 Tasdiqlandi', processing: '📦 Tayyorlanmoqda', shipped: "🚚 Yo'lda",
  delivered: '✅ Yetkazildi', cancelled: '❌ Bekor qilindi',
};

function header() {
  return `<header class="order-view-header"><div class="header-top">
    <a class="back-button" href="index.html" aria-label="Orqaga">${icon('back', { size: 24 })}</a>
    <div class="header-center"><h1 class="page-title">Buyurtmani kuzatish</h1></div>
    <span style="width:40px"></span></div></header>`;
}

function form(prefill = '') {
  return `<div class="container" style="padding-top:24px">
    <div class="track-hero">
      <div class="track-hero__icon">🔎</div>
      <h2>Buyurtmangiz qayerda?</h2>
      <p class="muted">Buyurtma raqamini kiriting (masalan, ${esc(config.orders?.numberPrefix || 'FB')}-123456).</p>
    </div>
    <div class="field" style="margin-top:16px"><label class="field__label">Buyurtma raqami</label>
      <input class="input" id="num" value="${esc(prefill)}" placeholder="${esc(config.orders?.numberPrefix || 'FB')}-123456" autocomplete="off"></div>
    <button class="btn btn--block" id="trackBtn">${icon('search', { size: 18 })} Qidirish</button>
    ${recentList()}
    <div id="result"></div>
  </div>`;
}

/* Shu qurilmadagi oxirgi buyurtmalar — raqamni yodlash shart emas. */
function recentList() {
  const orders = dataService.getOrders().slice(0, 3);
  if (!orders.length) return '';
  return `<div class="field__label" style="margin-top:20px">Oxirgi buyurtmalaringiz</div>
    <div class="search-tags">${orders.map((o) => `<button class="chip" data-num="${esc(o.number)}">${esc(o.number)}</button>`).join('')}</div>`;
}

function timeline(status) {
  const reached = FLOW.indexOf(status);
  return `<div class="tracking-timeline" style="margin-top:16px">
    ${['Buyurtma berildi', 'Tasdiqlandi', "Yo'lga chiqdi", 'Yetkazildi'].map((label, i) => {
      const cls = i < reached ? 'completed' : i === reached ? 'current' : '';
      return `<div class="timeline-item ${cls}"><div class="timeline-dot">${i < reached ? '✓' : i + 1}</div>
        <div class="timeline-content"><div class="timeline-title">${label}</div>
          <div class="timeline-description">${i <= reached ? 'Bajarildi' : 'Kutilmoqda'}</div></div></div>`;
    }).join('')}
  </div>`;
}

function showResult(order) {
  const box = document.getElementById('result');
  if (!order) {
    box.innerHTML = `<div class="empty-state" style="padding:32px 0"><div class="empty-state__emoji">🧐</div>
      <h3>Buyurtma topilmadi</h3><p>Raqamni tekshirib, qayta urinib ko'ring.</p></div>`;
    return;
  }
  const st = order.status === 'cancelled' ? 'pending' : order.status === 'processing' ? 'paid' : order.status;
  const label = STATUS[order.status] || STATUS.pending;
  box.innerHTML = `
    <div class="status-card" style="margin-top:20px">
      <div class="status-icon">${label.split(' ')[0]}</div>
      <div class="status-info"><div class="status-text">${label.slice(label.indexOf(' ') + 1)}</div>
        <div class="status-description">${esc(order.number)} · ${formatDate(order.createdAt)}</div>
        <div class="estimated-delivery">${(order.items || []).reduce((n, i) => n + (i.qty || 1), 0)} ta mahsulot · ${formatPrice(order.total)}</div></div>
    </div>
    ${timeline(st)}
    <a class="btn btn--outline btn--block" style="margin-top:16px" href="order.html?id=${encodeURIComponent(order.id)}">Batafsil</a>`;
}

function render() {
  document.getElementById('appbar').innerHTML = header();
  bindThemeToggle();
  screen.innerHTML = form();
  wire();
}

function wire() {
  const track = () => {
    const num = document.getElementById('num').value.trim().toUpperCase();
    if (!num) { toast('Buyurtma raqamini kiriting', { kind: 'danger' }); return; }
    const order = dataService.getOrders().find((o) => (o.number || o.id).toUpperCase() === num);
    haptic(order ? 'success' : 'error');
    showResult(order || null);
  };
  document.getElementById('trackBtn').addEventListener('click', track);
  document.getElementById('num').addEventListener('keydown', (e) => { if (e.key === 'Enter') track(); });
  screen.querySelectorAll('[data-num]').forEach((b) => b.addEventListener('click', () => { document.getElementById('num').value = b.dataset.num; track(); }));
}

render();
