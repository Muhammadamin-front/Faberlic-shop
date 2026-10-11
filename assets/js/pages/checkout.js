/**
 * Faberlic — Buyurtmani rasmiylashtirish
 * Bitta forma: buyurtma tarkibi, mijoz ma'lumotlari, yetkazib berish turi, to'lov usuli,
 * izoh, shartlarga rozilik. Buyurtma mijoz telefonida saqlanadi va adminga yuboriladi.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { formatPrice } from '../core/format.js';
import { dataService, cartTotals } from '../core/store.js';
import { esc, toast } from '../core/ui.js';
import { haptic } from '../core/telegram.js';
import { pay, enabledMethods, methodById } from '../core/payments.js';
import { bindThemeToggle } from '../components.js';

bootstrap();

const NS = config.data.persistNamespace;
const screen = document.getElementById('screen');
const cart = dataService.getCart();
const promo = JSON.parse(localStorage.getItem(`${NS}:promo`) || 'null');
const defaultAddr = dataService.getAddresses().find((a) => a.default) || {};
const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

if (!cart.length) location.href = 'cart.html';

const { shippingFlat, expressShipping } = config.commerce;
const DELIVERY = {
  standard: { name: 'Standart yetkazish', desc: '1–2 kun ichida', price: shippingFlat },
  express:  { name: 'Tezkor yetkazish', desc: `Shu kunning o'zida (${config.brand.city} bo'ylab)`, price: expressShipping ?? shippingFlat },
  pickup:   { name: 'Olib ketish', desc: "Do'kondan o'zingiz olib ketasiz", price: 0 },
};
const REGIONS = ['Toshkent shahri', 'Toshkent viloyati', 'Andijon', 'Buxoro', "Farg'ona", 'Jizzax', 'Xorazm',
  'Namangan', 'Navoiy', 'Qashqadaryo', "Qoraqalpog'iston", 'Samarqand', 'Sirdaryo', 'Surxondaryo'];

const state = {
  delivery: 'standard',
  payment: (enabledMethods()[0] || {}).id || 'cod',
  agree: true,
};

function totals() {
  return cartTotals(cart, promo, DELIVERY[state.delivery].price);
}

function paymentSectionHTML() {
  const rows = enabledMethods().map((m) => `<label class="payment-option">
    <input type="radio" name="payment" value="${m.id}" ${state.payment === m.id ? 'checked' : ''}>
    <div class="option-content"><div class="payment-icon">${m.icon}</div>
      <div class="option-info"><div class="option-name">${esc(m.label)}</div>
        <div class="option-description">${esc(m.note || '')}</div></div></div>
  </label>`).join('');
  return `<div class="payment-section" id="paymentSection"><h3 class="section-title">To'lov usuli</h3>
    <div class="payment-options">${rows}</div></div>`;
}

function deliveryOption(id) {
  const d = DELIVERY[id];
  return `<label class="delivery-option">
    <input type="radio" name="delivery" value="${id}" ${state.delivery === id ? 'checked' : ''}>
    <div class="option-content"><div class="option-info"><div class="option-name">${d.name}</div>
      <div class="option-description">${esc(d.desc)}</div></div>
      <div class="option-price">${d.price ? formatPrice(d.price) : t('cart.free')}</div></div>
  </label>`;
}

function summaryRows(tot) {
  return `
    <div class="total-row"><span class="total-label">${t('cart.subtotal')}</span><span>${formatPrice(tot.subtotal)}</span></div>
    ${tot.discount ? `<div class="total-row"><span class="total-label">${t('cart.discount')}</span><span>-${formatPrice(tot.discount)}</span></div>` : ''}
    <div class="total-row"><span class="total-label">${t('cart.shipping')}</span><span>${tot.shipping ? formatPrice(tot.shipping) : t('cart.free')}</span></div>
    <div class="total-row"><span class="total-label"><b>${t('cart.total')}</b></span><span class="total-amount">${formatPrice(tot.total)}</span></div>`;
}

function render() {
  document.getElementById('appbar').innerHTML = `<header class="checkout-header"><div class="header-top">
    <a class="back-button" href="cart.html" aria-label="Orqaga">${icon('back', { size: 24 })}</a>
    <div class="header-center"><h1 class="page-title">Rasmiylashtirish</h1></div>
    <div class="header-spacer"></div></div></header>`;
  bindThemeToggle();

  const tot = totals();
  const name = defaultAddr.name || [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(' ');

  screen.innerHTML = `<div class="checkout-content">
    <div class="order-summary-section"><h3 class="section-title">Buyurtma tarkibi</h3>
      <div class="order-items">
        ${cart.map((it) => `<div class="co-item"><span class="co-item__name">${esc(it.name)}${it.meta?.variant ? ` <span class="muted">(${esc(it.meta.variant)})</span>` : ''}</span>
          <span class="co-item__qty">×${it.qty}</span><span class="co-item__price">${formatPrice(it.price * it.qty)}</span></div>`).join('')}
      </div>
      <div class="order-total" id="coTotals">${summaryRows(tot)}</div>
    </div>

    <div class="shipping-section"><h3 class="section-title">Ma'lumotlaringiz</h3>
      <div class="form-group"><label class="form-label">Ism familiya *</label>
        <input type="text" class="form-input" id="fullName" value="${esc(name || '')}" placeholder="Masalan: Dilnoza Karimova" autocomplete="name"></div>
      <div class="form-group"><label class="form-label">Telefon raqam *</label>
        <input type="tel" class="form-input" id="phone" value="${esc(defaultAddr.phone || '+998 ')}" placeholder="+998 90 123 45 67" autocomplete="tel" inputmode="tel"></div>
      <div id="addressFields">
        <div class="form-group"><label class="form-label">Viloyat *</label>
          <select class="form-select" id="region">${REGIONS.map((r) => `<option value="${esc(r)}" ${(defaultAddr.region || REGIONS[0]) === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Shahar / tuman *</label>
          <input type="text" class="form-input" id="city" value="${esc(defaultAddr.city || '')}" placeholder="Masalan: Yunusobod tumani"></div>
        <div class="form-group"><label class="form-label">Manzil *</label>
          <input type="text" class="form-input" id="address" value="${esc(defaultAddr.line1 || '')}" placeholder="Ko'cha, uy, xonadon"></div>
        <div class="form-group"><label class="form-label">Mo'ljal</label>
          <input type="text" class="form-input" id="landmark" value="${esc(defaultAddr.line2 || '')}" placeholder="Masalan: maktab yonida"></div>
      </div>
    </div>

    <div class="delivery-section"><h3 class="section-title">Yetkazib berish</h3>
      <div class="delivery-options">${Object.keys(DELIVERY).map(deliveryOption).join('')}</div>
      ${config.commerce.freeShippingThreshold ? `<p class="muted text-sm" style="margin-top:8px">${formatPrice(config.commerce.freeShippingThreshold)} dan ortiq xaridda yetkazib berish bepul.</p>` : ''}
    </div>

    ${paymentSectionHTML()}

    <div class="notes-section"><h3 class="section-title">Izoh (ixtiyoriy)</h3>
      <textarea class="form-textarea" id="notes" placeholder="Qo'ng'iroq qilish vaqti yoki boshqa istaklaringiz…"></textarea></div>

    <div class="terms-section"><label class="checkbox-container">
      <input type="checkbox" id="agree" ${state.agree ? 'checked' : ''}><span class="checkmark"></span>
      <span class="checkbox-text"><a href="legal.html?doc=terms" class="terms-link">Foydalanish shartlari</a> va <a href="legal.html?doc=privacy" class="terms-link">maxfiylik siyosati</a>ga roziman</span>
    </label></div>
  </div>`;

  document.getElementById('bottombar').innerHTML = `<div class="bottom-actions">
    <div class="total-display"><div class="total-label">Jami</div><div class="total-amount" id="bottomTotal">${formatPrice(tot.total)}</div></div>
    <button class="place-order-btn" id="placeOrderBtn" ${state.agree ? '' : 'disabled'}>Buyurtma berish</button>
  </div>`;

  wire();
}

function refreshTotals() {
  const tot = totals();
  document.getElementById('coTotals').innerHTML = summaryRows(tot);
  document.getElementById('bottomTotal').textContent = formatPrice(tot.total);
  document.getElementById('addressFields').style.display = state.delivery === 'pickup' ? 'none' : '';
}

function wire() {
  screen.querySelectorAll('input[name="delivery"]').forEach((r) => r.addEventListener('change', () => {
    state.delivery = r.value; refreshTotals(); haptic('selection');
  }));
  screen.querySelectorAll('input[name="payment"]').forEach((r) => r.addEventListener('change', () => { state.payment = r.value; haptic('selection'); }));
  document.getElementById('agree').addEventListener('change', (e) => {
    state.agree = e.target.checked;
    document.getElementById('placeOrderBtn').disabled = !state.agree;
  });
  document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
}

const phoneOk = (p) => p.replace(/\D/g, '').length >= 9;

async function placeOrder() {
  const v = (id) => document.getElementById(id)?.value.trim() || '';
  const pickup = state.delivery === 'pickup';
  if (!v('fullName') || !phoneOk(v('phone')) || (!pickup && (!v('city') || !v('address')))) {
    toast("Iltimos, * belgili maydonlarni to'ldiring", { kind: 'danger' }); haptic('error'); return;
  }
  const method = methodById(state.payment);
  if (!method) { toast("To'lov usulini tanlang", { kind: 'danger' }); haptic('error'); return; }

  const address = pickup
    ? { name: v('fullName'), phone: v('phone') }
    : dataService.saveAddress({
      id: defaultAddr.id, label: defaultAddr.label || 'Uy', name: v('fullName'), phone: v('phone'),
      region: v('region'), city: v('city'), line1: v('address'), line2: v('landmark'), country: "O'zbekiston", default: true,
    });
  const tot = totals();
  const draft = {
    items: cart, ...tot, address, paymentMethod: method.label, paymentProvider: method.provider, promo,
    shippingMethod: DELIVERY[state.delivery].name, notes: v('notes'),
    customer: tgUser ? { id: tgUser.id, username: tgUser.username || '', name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') } : null,
  };

  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;
  showProcessing();
  try {
    const result = await pay({ method, amount: tot.total, order: draft });
    if (result.status === 'failed') {
      document.getElementById('coProcessing')?.remove();
      btn.disabled = false;
      toast("Xatolik yuz berdi. Qaytadan urinib ko'ring.", { kind: 'danger' }); haptic('error');
      return;
    }
    await finaliseOrder(draft, result);
  } catch (err) {
    document.getElementById('coProcessing')?.remove();
    btn.disabled = false;
    toast(`Xatolik: ${err.message}`, { kind: 'danger' }); haptic('error');
  }
}

async function finaliseOrder(draft, result) {
  const order = dataService.placeOrder({
    ...draft,
    paymentStatus: result.status, // 'paid' | 'pending'
    paymentReference: result.reference || null,
  });
  const sent = await dataService.sendOrder(order);
  dataService.updateOrder(order.id, { sentToShop: sent });
  dataService.clearCart();
  localStorage.removeItem(`${NS}:promo`);
  haptic('success');
  document.getElementById('coProcessing')?.remove();
  showSuccess(order, sent);
}

function showProcessing() {
  const el = document.createElement('div');
  el.id = 'coProcessing'; el.className = 'co-modal';
  el.innerHTML = `<div class="modal-content"><div class="co-spinner"></div>
    <h3 class="processing-title">Buyurtma yuborilmoqda</h3>
    <p class="processing-description">Iltimos, kuting…</p></div>`;
  document.body.appendChild(el);
}

function showSuccess(order, sent) {
  const contact = config.brand.telegram || config.brand.phone || '';
  const el = document.createElement('div');
  el.className = 'co-modal';
  el.innerHTML = `<div class="modal-content"><div class="success-icon">🌸</div>
    <h3 class="success-title">Buyurtmangiz qabul qilindi!</h3>
    <p class="success-description">Buyurtma raqami: <b>${esc(order.number)}</b>.<br>
      Operatorimiz tez orada siz bilan bog'lanadi.</p>
    ${!sent && contact ? `<p class="processing-description" style="margin-top:4px">Agar bog'lanishmasa, bizga yozing: <b>${esc(contact)}</b></p>` : ''}
    <div class="success-actions">
      <button class="track-order-btn" id="trackBtn">Buyurtmani ko'rish</button>
      <button class="continue-shopping-btn" onclick="location.href='index.html'">Xaridni davom ettirish</button>
    </div></div>`;
  document.body.appendChild(el);
  el.querySelector('#trackBtn').addEventListener('click', () => { location.href = `order.html?id=${encodeURIComponent(order.id)}`; });
}

render();
