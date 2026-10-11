/**
 * Faberlic — Shaxsiy ma'lumotlar
 * Rasm, asosiy ma'lumotlar va bildirishnoma sozlamalari. Telefonda saqlanadi.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { icon } from '../core/icons.js';
import { esc, toast } from '../core/ui.js';
import { haptic } from '../core/telegram.js';
import { bindThemeToggle } from '../components.js';

bootstrap();

const NS = config.data.persistNamespace;
const screen = document.getElementById('screen');
const key = `${NS}:profile`;
const AVATAR_KEY = `${NS}:avatar`;        // shared with the Profile page
const MAX_AVATAR = 2 * 1024 * 1024;       // 2 MB
const saved = JSON.parse(localStorage.getItem(key) || '{}');
let avatar = JSON.parse(localStorage.getItem(AVATAR_KEY) || 'null'); // { type:'image'|'emoji', value }

function avatarInner() {
  if (avatar?.type === 'image') return `<img src="${avatar.value}" alt="Profil rasmi" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
  return avatar?.value || config.brand.logoEmoji;
}
const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || null;
const v = {
  first: saved.firstName ?? tgUser?.first_name ?? '',
  last: saved.lastName ?? tgUser?.last_name ?? '',
  email: saved.email ?? '',
  code: saved.code ?? '+998',
  phone: saved.phone ?? '',
  prefs: saved.prefs ?? { telegram: true, sms: false, marketing: true },
};

function field(label, id, value, type = 'text', extra = '') {
  return `<div class="field"><label class="field__label" for="${id}">${label}</label>
    <input class="input" id="${id}" type="${type}" value="${esc(value)}" ${extra}></div>`;
}
function pref(id, title, desc, on) {
  return `<div class="preference-item"><div class="preference-info">
    <div class="preference-title">${title}</div><div class="preference-description">${desc}</div></div>
    <label class="switch"><input type="checkbox" data-pref="${id}" ${on ? 'checked' : ''}><span class="switch__track"></span></label></div>`;
}

document.getElementById('appbar').innerHTML = `<header class="personal-info-header"><div class="header-top">
  <a class="back-button" href="profile.html" aria-label="Orqaga">${icon('back', { size: 24 })}</a>
  <div class="header-center"><h1 class="page-title">Shaxsiy ma'lumotlar</h1>
    <span class="info-subtitle">Ma'lumotlaringizni yangilang</span></div>
  <button class="save-button" id="saveTop">Saqlash</button>
</div></header>`;
bindThemeToggle();

screen.innerHTML = `<div class="personal-info-content">
  <div class="profile-photo-section">
    <div class="profile-photo"><div class="photo-placeholder" id="photoPreview">${avatarInner()}</div></div>
    <button class="change-photo-btn" id="changePhoto">Rasmni o'zgartirish</button>
    <input type="file" id="photoFile" accept="image/*" hidden>
  </div>

  <div class="form-section"><div class="form-section__title">Asosiy ma'lumotlar</div>
    <div class="form-grid">${field('Ism', 'p_first', v.first)}${field('Familiya', 'p_last', v.last)}</div>
    ${field('Email (ixtiyoriy)', 'p_email', v.email, 'email')}
    <div class="field"><label class="field__label">Telefon raqam</label>
      <div class="phone-input-container">
        <input class="input country-code" id="p_code" value="${esc(v.code)}">
        <input class="input" id="p_phone" type="tel" value="${esc(v.phone)}" placeholder="90 123 45 67">
      </div></div>
  </div>

  <div class="form-section"><div class="form-section__title">Bildirishnomalar</div>
    <div class="preferences-list">
      ${pref('telegram', 'Telegram xabarlari', 'Buyurtma holati haqida', v.prefs.telegram)}
      ${pref('sms', 'SMS xabarlar', 'Yetkazib berish haqida', v.prefs.sms)}
      ${pref('marketing', 'Aksiyalar', 'Chegirma va yangiliklar', v.prefs.marketing)}
    </div>
  </div>

</div>`;

document.getElementById('bottombar').innerHTML =
  `<div class="bottom-bar"><button class="btn btn--block" id="saveBottom">Saqlash</button></div>`;

function saveAll() {
  const g = (id) => document.getElementById(id).value.trim();
  const prefs = {};
  screen.querySelectorAll('[data-pref]').forEach((c) => { prefs[c.dataset.pref] = c.checked; });
  localStorage.setItem(key, JSON.stringify({
    firstName: g('p_first'), lastName: g('p_last'), email: g('p_email'),
    code: g('p_code'), phone: g('p_phone'), prefs,
  }));
  haptic('success'); toast('Saqlandi', { kind: 'success' });
}
document.getElementById('saveTop').addEventListener('click', saveAll);
document.getElementById('saveBottom').addEventListener('click', saveAll);
document.getElementById('changePhoto').addEventListener('click', () => document.getElementById('photoFile').click());
document.getElementById('photoFile').addEventListener('change', (e) => { handlePhoto(e.target.files?.[0]); e.target.value = ''; });

function handlePhoto(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('Rasm faylini tanlang', { kind: 'danger' }); return; }
  if (file.size > MAX_AVATAR) { toast("Rasm 2 MB dan kichik bo'lishi kerak", { kind: 'danger' }); return; }
  const reader = new FileReader();
  reader.onload = () => {
    avatar = { type: 'image', value: reader.result };
    localStorage.setItem(AVATAR_KEY, JSON.stringify(avatar));
    document.getElementById('photoPreview').innerHTML = avatarInner();
    haptic('success'); toast('Rasm yangilandi', { kind: 'success' });
  };
  reader.readAsDataURL(file);
}

