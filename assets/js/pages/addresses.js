/**
 * Faberlic — Manzillar
 * Asosiy manzil, manzil kartalari (tahrirlash/o'chirish) va qo'shish formasi.
 */
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { dataService } from '../core/store.js';
import { esc, toast, bottomSheet } from '../core/ui.js';
import { haptic, confirm } from '../core/telegram.js';
import { bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
const TYPE_ICON = { uy: '🏠', ish: '🏢', boshqa: '📍', home: '🏠', work: '🏢', other: '📍' };

function card(a) {
  const type = a.label ? a.label.toLowerCase() : 'uy';
  return `<div class="address-card${a.default ? ' default' : ''}" data-id="${a.id}">
    <div class="address-card__top">
      <div class="address-type">${TYPE_ICON[type] || '📍'} ${esc(a.label || 'Uy')}
        ${a.default ? '<span class="default-badge">Asosiy</span>' : ''}</div>
      <div class="address-actions">
        <button class="address-action-btn" data-edit="${a.id}" aria-label="Tahrirlash">${icon('edit', { size: 16 })}</button>
        <button class="address-action-btn delete" data-del="${a.id}" aria-label="O'chirish">${icon('trash', { size: 16 })}</button>
      </div>
    </div>
    <div class="address-details">
      <div class="address-name">${esc(a.name)}</div>
      <div class="address-text">${esc([a.region, a.city].filter(Boolean).join(', '))}<br>
        ${esc(a.line1 || '')}${a.line2 ? ` (mo'ljal: ${esc(a.line2)})` : ''}<br>
        ${a.phone ? esc(a.phone) : ''}</div>
    </div>
    ${!a.default ? `<button class="address-set-default" data-default="${a.id}">Asosiy qilish</button>` : ''}
  </div>`;
}

function render() {
  const list = dataService.getAddresses();
  const hasDefault = list.some((a) => a.default);

  document.getElementById('appbar').innerHTML = `<header class="addresses-header"><div class="header-top">
    <a class="back-button" href="profile.html" aria-label="Orqaga">${icon('back', { size: 24 })}</a>
    <div class="header-center"><h1 class="page-title">Manzillar</h1>
      <span class="addresses-subtitle">Yetkazib berish manzillari</span></div>
    <button class="add-button" id="addBtn" aria-label="Qo'shish">${icon('plus', { size: 24 })}</button>
  </div></header>`;
  bindThemeToggle();

  screen.innerHTML = `<div class="addresses-content">
    ${list.length && !hasDefault ? `<div class="default-address-banner"><div class="banner-icon">🏠</div>
      <div class="banner-text">Tez rasmiylashtirish uchun <strong>asosiy manzilni tanlang</strong></div></div>` : ''}
    ${list.length
      ? `<div class="addresses-list">${list.map(card).join('')}</div>`
      : `<div class="empty-addresses"><div class="empty-icon">📍</div>
          <h3 class="empty-title">Manzillar yo'q</h3><p>Birinchi yetkazib berish manzilingizni qo'shing.</p>
          <button class="add-address-btn" id="addFirst">Manzil qo'shish</button></div>`}
  </div>`;

  wire(list);
}

function wire(list) {
  document.getElementById('addBtn').addEventListener('click', () => edit(null));
  document.getElementById('addFirst')?.addEventListener('click', () => edit(null));
  screen.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => edit(list.find((a) => a.id === b.dataset.edit))));
  screen.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => del(b.dataset.del)));
  screen.querySelectorAll('[data-default]').forEach((b) => b.addEventListener('click', () => setDefault(b.dataset.default)));
}

function setDefault(id) {
  dataService.getAddresses().forEach((a) => dataService.saveAddress({ ...a, default: a.id === id }));
  haptic('selection'); render();
}
async function del(id) {
  if (await confirm("Manzil o'chirilsinmi?")) { dataService.deleteAddress(id); haptic('medium'); toast("Manzil o'chirildi"); render(); }
}

function edit(a) {
  const d = a || {};
  const type = (d.label || 'uy').toLowerCase();
  const form = `
    <div class="field"><label class="field__label">Manzil turi</label>
      <select class="input" id="f_type">
        ${[['uy', '🏠 Uy'], ['ish', '🏢 Ish'], ['boshqa', '📍 Boshqa']].map(([v, l]) => `<option value="${v}" ${type === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select></div>
    <div class="field"><label class="field__label">Ism familiya *</label><input class="input" id="f_name" value="${esc(d.name || '')}"></div>
    <div class="field"><label class="field__label">Telefon *</label><input class="input" id="f_phone" value="${esc(d.phone || '+998 ')}" placeholder="+998 90 123 45 67" inputmode="tel"></div>
    <div class="form-grid">
      <div class="field"><label class="field__label">Viloyat *</label><input class="input" id="f_state" value="${esc(d.region || '')}" placeholder="Toshkent shahri"></div>
      <div class="field"><label class="field__label">Shahar / tuman *</label><input class="input" id="f_city" value="${esc(d.city || '')}"></div>
    </div>
    <div class="field"><label class="field__label">Manzil *</label><input class="input" id="f_line1" value="${esc(d.line1 || '')}" placeholder="Ko'cha, uy, xonadon"></div>
    <div class="field"><label class="field__label">Mo'ljal</label><input class="input" id="f_line2" value="${esc(d.line2 || '')}" placeholder="Masalan: maktab yonida"></div>
    <label class="checkbox-container" style="margin-bottom:16px"><input type="checkbox" id="f_default" ${d.default ? 'checked' : ''}>
      <span class="checkmark"></span><span class="checkbox-text">Asosiy manzil qilish</span></label>
    <button class="btn btn--block" id="f_save">Saqlash</button>`;
  const sheet = bottomSheet({ title: a ? 'Manzilni tahrirlash' : 'Yangi manzil', content: form });
  sheet.el.querySelector('#f_save').addEventListener('click', () => {
    const v = (id) => sheet.el.querySelector('#' + id).value.trim();
    if (!v('f_name') || !v('f_line1') || !v('f_city')) { toast("Majburiy maydonlarni to'ldiring", { kind: 'danger' }); return; }
    dataService.saveAddress({
      id: d.id, label: v('f_type').charAt(0).toUpperCase() + v('f_type').slice(1),
      name: v('f_name'), line1: v('f_line1'), line2: v('f_line2'),
      city: v('f_city'), region: v('f_state'), country: "O'zbekiston",
      phone: v('f_phone'), default: sheet.el.querySelector('#f_default').checked || d.default,
    });
    haptic('success'); sheet.close(); toast('Manzil saqlandi', { kind: 'success' }); render();
  });
}

render();
