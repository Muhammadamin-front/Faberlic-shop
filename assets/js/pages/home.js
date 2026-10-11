/**
 * Faberlic — Bosh sahifa
 * Sarlavha, qidiruv, aksiya banneri, kategoriyalar, xit va yangi mahsulotlar, afzalliklar.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { formatPrice } from '../core/format.js';
import { dataService } from '../core/store.js';
import { esc } from '../core/ui.js';
import { tabBar, themeToggleButton, bindThemeToggle, productCard, bindWishButtons } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
const TINTS = ['tint-pink', 'tint-purple', 'tint-blue', 'tint-green', 'tint-orange', 'tint-red'];

function header() {
  const logo = config.brand.logoSvg || config.brand.logoEmoji;
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const hello = tgUser?.first_name ? `Salom, ${tgUser.first_name}!` : t('home.greeting');
  return `<div class="home-header">
    <div class="hh-row">
      <span class="hh-avatar">${logo}</span>
      <div class="hh-center">
        <span class="hh-title">${esc(config.brand.name)}</span>
        <span class="hh-sub">${esc(hello)}</span>
      </div>
      <span class="hh-actions">
        ${config.theme.allowUserToggle ? themeToggleButton() : ''}
        <a class="appbar__btn" href="cart.html" aria-label="Savat">${icon('cart', { size: 22 })}
          <span class="appbar__badge hidden" data-badge="cart">0</span></a>
      </span>
    </div>
    ${config.features.search ? `<a class="home-search" href="search.html">
      ${icon('search', { size: 18 })}<span>${t('home.search_placeholder')}</span></a>` : ''}
  </div>`;
}

function heroBanner() {
  const promo = Object.entries(config.commerce.promoCodes || {})[0];
  return `<a class="home-hero" href="deals.html">
    <div class="home-hero__text">
      <span class="home-hero__eyebrow">Maxsus taklif</span>
      <h2>Teringizga g'amxo'rlik — chegirmalar bilan</h2>
      ${promo ? `<span class="home-hero__code">Promo-kod: <b>${esc(promo[0])}</b> · ${esc(promo[1].label)}</span>` : ''}
    </div>
    <span class="home-hero__emoji">🌷</span>
  </a>`;
}

function categoryChip(c, i) {
  return `<a class="home-cat" href="catalog.html?category=${c.id}">
    <span class="home-cat__icon ${TINTS[i % TINTS.length]}">${c.icon}</span>
    <span class="home-cat__name">${esc(c.name)}</span>
  </a>`;
}

function perks() {
  const free = config.commerce.freeShippingThreshold;
  const items = [
    { icon: 'truck', title: 'Tez yetkazish', text: free ? `${formatPrice(free)} dan bepul` : `${esc(config.brand.city)} bo'ylab` },
    { icon: 'check', title: 'Original', text: '100% sifat kafolati' },
    { icon: 'card', title: "Qulay to'lov", text: 'Naqd, Click, Payme' },
  ];
  return `<div class="home-perks">${items.map((p) => `<div class="home-perk">
    <span class="home-perk__icon">${icon(p.icon, { size: 20 })}</span>
    <span class="home-perk__title">${p.title}</span>
    <span class="home-perk__text">${p.text}</span></div>`).join('')}</div>`;
}

function section(title, href, list) {
  if (!list.length) return '';
  return `<div class="home-section">
    <div class="home-section__head">
      <span class="home-section__title">${esc(title)}</span>
      ${href ? `<a class="home-section__more" href="${href}">${t('action.see_all')}</a>` : ''}
    </div>
    <div class="pcard-grid home-grid">${list.map(productCard).join('')}</div>
  </div>`;
}

async function init() {
  const [categories, all] = await Promise.all([dataService.getCategories(), dataService.getProducts()]);
  const hits = all.filter((p) => p.badges?.includes('Xit'));
  const fresh = all.filter((p) => p.badges?.includes('Yangi'));
  const popular = [...hits, ...all.filter((p) => !hits.includes(p))].slice(0, 4);

  document.getElementById('appbar').innerHTML = header();
  bindThemeToggle();

  screen.innerHTML = `
    ${heroBanner()}

    ${config.features.categories ? `
      <div class="home-section">
        <div class="home-section__head">
          <span class="home-section__title">${t('home.categories')}</span>
          <a class="home-section__more" href="categories.html">${t('action.see_all')}</a>
        </div>
        <div class="home-cats">${categories.map(categoryChip).join('')}</div>
      </div>` : ''}

    ${section(t('home.trending'), 'catalog.html?sort=rating', popular)}
    ${perks()}
    ${section(t('home.new_arrivals'), 'catalog.html', fresh)}
  `;

  bindWishButtons(screen);
  document.getElementById('tabbar').innerHTML = tabBar('home');
}

init();
