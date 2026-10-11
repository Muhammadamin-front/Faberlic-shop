/**
 * Faberlic — Profil
 * Avatar, ism, statistika, bo'limlar ro'yxati, bildirishnomalar. Telegram foydalanuvchisi ma'lumotlaridan foydalanadi.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { dataService } from '../core/store.js';
import { esc, toast, bottomSheet } from '../core/ui.js';
import { haptic } from '../core/telegram.js';
import { tabBar, themeToggleButton, bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
const NS = config.data.persistNamespace;
const prefs = JSON.parse(localStorage.getItem(`${NS}:prefs`) || '{}');
const savedProfile = JSON.parse(localStorage.getItem(`${NS}:profile`) || '{}');
const AVATAR_KEY = `${NS}:avatar`;
const MAX_AVATAR = 2 * 1024 * 1024;
const EMOJIS = ['🌸', '🌷', '🌹', '🌺', '🌼', '💐', '🦋', '✨', '💖', '👩', '👸', '😊', '🥰', '😎', '🐱', '☕'];
let avatar = JSON.parse(localStorage.getItem(AVATAR_KEY) || 'null'); // { type:'image'|'emoji', value }

function tgUser() { return window.Telegram?.WebApp?.initDataUnsafe?.user || null; }
function saveAvatar() { avatar ? localStorage.setItem(AVATAR_KEY, JSON.stringify(avatar)) : localStorage.removeItem(AVATAR_KEY); }

function avatarInner() {
  if (avatar?.type === 'image') return `<img class="avatar-photo" src="${avatar.value}" alt="Profil rasmi">`;
  return `<div class="avatar-placeholder">${avatar?.value || config.brand.logoEmoji}</div>`;
}

const ICON_TINTS = ['tint-blue', 'tint-green', 'tint-orange', 'tint-pink', 'tint-purple', 'tint-red'];
let tintIdx = 0;

function optionItem({ icon: ic, title, subtitle, href, badge, toggle }) {
  const right = toggle
    ? `<label class="switch"><input type="checkbox" data-pref="notifications" ${prefs.notifications !== false ? 'checked' : ''}><span class="switch__track"></span></label>`
    : `${badge != null && badge !== 0 ? `<span class="option-badge">${badge}</span>` : ''}<span class="option-arrow">›</span>`;
  const tag = href ? 'a' : 'div';
  const attr = href ? ` href="${href}"` : '';
  return `<${tag} class="option-item"${attr}>
    <span class="option-icon ${ICON_TINTS[tintIdx++ % ICON_TINTS.length]}">${icon(ic, { size: 22 })}</span>
    <span class="option-details"><span class="option-title">${esc(title)}</span>
      <span class="option-subtitle">${esc(subtitle)}</span></span>
    ${right}
  </${tag}>`;
}

function section(title, items) {
  const list = items.filter(Boolean).map(optionItem).join('');
  if (!list) return '';
  return `<div class="option-section"><h3 class="section-title">${esc(title)}</h3>
    <div class="options-list">${list}</div></div>`;
}

function render() {
  const user = tgUser();
  const savedName = [savedProfile.firstName, savedProfile.lastName].filter(Boolean).join(' ');
  const name = savedName || (user ? [user.first_name, user.last_name].filter(Boolean).join(' ') : 'Mehmon');
  const verified = Boolean(user);
  const handle = user?.username ? '@' + user.username : '';
  const email = savedProfile.email || handle || '';
  const complete = Boolean(savedName || email); // has the shopper filled in details?
  const f = config.features;
  const orders = dataService.getOrders().length;
  const wish = dataService.getWishlist().length;
  const addr = dataService.getAddresses().length;

  document.getElementById('appbar').innerHTML = `<header class="profile-header"><div class="header-top">
    <span style="width:40px"></span>
    <div class="header-center"><h1 class="page-title">${t('profile.title')}</h1>
      <span class="profile-subtitle">Shaxsiy kabinet</span></div>
    ${config.theme.allowUserToggle ? themeToggleButton() : '<span style="width:40px"></span>'}
  </div></header>`;
  bindThemeToggle();
  tintIdx = 0; // stable colour cycle for the menu icons on each render

  screen.innerHTML = `<div class="profile-content">
    <div class="profile-info-section">
      <div class="profile-avatar">
        <div class="avatar-image${avatar?.type === 'image' ? ' has-photo' : ''}">${avatarInner()}</div>
        <button class="change-avatar-btn" id="avatarBtn" aria-label="Rasmni o'zgartirish">${icon('image', { size: 16 })}</button>
      </div>
      <div class="profile-name">${esc(name)}${verified ? ` <span class="profile-verified" title="Telegram orqali tasdiqlangan">${icon('check', { size: 16 })}</span>` : ''}</div>
      ${complete
        ? `<div class="profile-email">${esc(email || `${config.brand.name} mijozi`)}</div>`
        : `<a class="profile-email profile-email--action" href="personal-info.html">Ma'lumotlaringizni to'ldiring ›</a>`}
      <div class="profile-badges">
        <span class="profile-badge">🌸 ${esc(config.brand.name)} mijozi</span>
      </div>
      <div class="profile-stats">
        <a class="stat-item" href="orders.html"><div class="stat-value">${orders}</div><div class="stat-label">Buyurtmalar</div></a>
        <a class="stat-item" href="wishlist.html"><div class="stat-value">${wish}</div><div class="stat-label">Sevimlilar</div></a>
        <a class="stat-item" href="addresses.html"><div class="stat-value">${addr}</div><div class="stat-label">Manzillar</div></a>
      </div>
    </div>
    <input type="file" id="avatarFile" accept="image/*" hidden>

    <div class="profile-options">
      ${section('Mening kabinetim', [
        { icon: 'bag', title: 'Buyurtmalar tarixi', subtitle: 'Barcha buyurtmalaringiz', href: 'orders.html', badge: orders },
        { icon: 'heart', title: 'Sevimlilar', subtitle: 'Saqlangan mahsulotlar', href: 'wishlist.html', badge: wish },
        f.addresses && { icon: 'map', title: 'Manzillar', subtitle: 'Yetkazib berish manzillari', href: 'addresses.html', badge: addr },
        f.promo && { icon: 'tag', title: 'Promo-kodlar', subtitle: 'Mavjud chegirma kodlari', href: 'coupons.html' },
        { icon: 'clock', title: "Ko'rilgan mahsulotlar", subtitle: "Yaqinda ko'rganlaringiz", href: 'recently-viewed.html' },
      ])}

      ${section('Sozlamalar', [
        { icon: 'user', title: "Shaxsiy ma'lumotlar", subtitle: 'Ism, telefon', href: 'personal-info.html' },
        { icon: 'gear', title: 'Sozlamalar', subtitle: "Ko'rinish va boshqalar", href: 'settings.html' },
        f.notifications && { icon: 'bell', title: 'Bildirishnomalar', subtitle: 'Buyurtma va aksiyalar haqida', toggle: true },
      ])}

      ${section('Yordam', [
        { icon: 'help', title: 'Savol-javoblar', subtitle: "Ko'p beriladigan savollar", href: 'help.html' },
        { icon: 'send', title: "Biz bilan bog'lanish", subtitle: esc(config.brand.telegram || config.brand.phone || ''), href: 'support.html' },
        { icon: 'info', title: 'Shartlar va maxfiylik', subtitle: 'Foydalanish qoidalari', href: 'legal.html' },
        { icon: 'info', title: t('profile.about'), subtitle: esc(config.brand.name), href: 'about.html' },
      ])}
    </div>
  </div>`;

  document.getElementById('tabbar').innerHTML = tabBar('profile');
  wire();
}

function wire() {
  document.getElementById('avatarBtn').addEventListener('click', openAvatarChooser);
  document.getElementById('avatarFile').addEventListener('change', (e) => { handleAvatarFile(e.target.files?.[0]); e.target.value = ''; });
  screen.querySelector('[data-pref="notifications"]')?.addEventListener('change', (e) => {
    prefs.notifications = e.target.checked;
    localStorage.setItem(`${NS}:prefs`, JSON.stringify(prefs));
    toast(`Bildirishnomalar ${e.target.checked ? 'yoqildi' : "o'chirildi"}`);
  });
}

/* Choose how to set the profile photo: upload a real image, pick an emoji, or remove. */
function openAvatarChooser() {
  const node = document.createElement('div');
  node.innerHTML = `<div class="stack gap-3">
    <button class="btn btn--block" id="chUpload">${icon('upload', { size: 18 })} Rasm yuklash</button>
    <button class="btn btn--outline btn--block" id="chEmoji">${icon('image', { size: 18 })} Emoji tanlash</button>
    ${avatar ? '<button class="btn btn--outline btn--block" id="chRemove" style="color:var(--danger);border-color:var(--danger)">Rasmni o\'chirish</button>' : ''}
    <p class="muted text-sm" style="text-align:center">JPG yoki PNG, 2&nbsp;MB gacha.</p>
  </div>`;
  const sheet = bottomSheet({ title: 'Profil rasmi', content: node });
  node.querySelector('#chUpload').addEventListener('click', () => { sheet.close(); document.getElementById('avatarFile').click(); });
  node.querySelector('#chEmoji').addEventListener('click', () => { sheet.close(); pickAvatarEmoji(); });
  node.querySelector('#chRemove')?.addEventListener('click', () => { avatar = null; saveAvatar(); sheet.close(); haptic('medium'); toast("Rasm o'chirildi"); render(); });
}

function handleAvatarFile(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('Rasm faylini tanlang', { kind: 'danger' }); return; }
  if (file.size > MAX_AVATAR) { toast("Rasm 2 MB dan kichik bo'lishi kerak", { kind: 'danger' }); return; }
  const reader = new FileReader();
  reader.onload = () => { avatar = { type: 'image', value: reader.result }; saveAvatar(); haptic('success'); toast('Rasm yangilandi', { kind: 'success' }); render(); };
  reader.readAsDataURL(file);
}

function pickAvatarEmoji() {
  const grid = `<div class="emoji-picker">${EMOJIS.map((e) => `<button data-e="${e}">${e}</button>`).join('')}</div>`;
  const sheet = bottomSheet({ title: 'Emoji tanlang', content: grid });
  sheet.el.querySelectorAll('[data-e]').forEach((b) => b.addEventListener('click', () => {
    avatar = { type: 'emoji', value: b.dataset.e }; saveAvatar(); haptic('success'); sheet.close(); toast('Avatar yangilandi', { kind: 'success' }); render();
  }));
}

render();
