/**
 * Faberlic — Mahsulot sahifasi
 * Galereya, ma'lumot, hajm tanlash, miqdor, tavsif, tarkib, qo'llash usuli, xususiyatlar,
 * sharhlar, "birga xarid qilinadi", o'xshash mahsulotlar va pastki "Savatga" paneli.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { formatPrice } from '../core/format.js';
import { dataService } from '../core/store.js';
import { esc, productImage, productGallery, toast } from '../core/ui.js';
import { haptic } from '../core/telegram.js';
import { productCard, bindWishButtons, bindThemeToggle, askPrice, askPriceButton } from '../components.js';
import { hasPrice } from '../data/catalog.js';

bootstrap();

const screen = document.getElementById('screen');
const id = new URLSearchParams(location.search).get('id');
let product = null;
let categoryName = '';
let qty = 1;
let variant = null;
let images = [];

const imgAttrs = (p) => `data-emoji="${p.emoji || ''}" data-color="${p.color || ''}"`;

function starRow(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => `<span class="star${i < full ? ' filled' : ''}">★</span>`).join('');
}

function gallery() {
  const many = images.length > 1;
  return `<div class="product-images-section">
    <div class="main-image-container">
      <img id="mainImage" class="main-image" src="${images[0]}" alt="${esc(product.name)}" ${imgAttrs(product)}>
      ${many ? `<div class="image-indicators">${images.map((_, i) => `<span class="indicator${i === 0 ? ' active' : ''}" data-ind="${i}"></span>`).join('')}</div>` : ''}
    </div>
    ${many ? `<div class="thumbnail-images">
      ${images.map((s, i) => `<img class="thumbnail${i === 0 ? ' active' : ''}" data-thumb="${i}" src="${s}" alt="rasm ${i + 1}" ${imgAttrs(product)}>`).join('')}
    </div>` : ''}
  </div>`;
}

function variantsSection() {
  if (!product.variants?.length) return '';
  return `<div class="product-options-section">
    <h4 class="option-title">Hajmi</h4>
    <div class="variant-chips" id="variants">
      ${product.variants.map((v, i) => `<button class="variant-chip${i === 0 ? ' active' : ''}" data-variant="${v.id}">${esc(v.label)}</button>`).join('')}
    </div>
  </div>`;
}

function infoBlock(title, text) {
  if (!text) return '';
  return `<div class="product-description-section"><h3 class="section-title">${title}</h3>
    <div class="description-content"><p>${esc(text)}</p></div></div>`;
}

function specs() {
  const rows = [
    ['Kategoriya', categoryName || '—'],
    ['Hajmi', product.volume],
    ['Teri turi', product.skinType],
    ['Artikul', product.sku],
    ['Mavjudligi', product.inStock ? `${product.stock} ta omborda` : 'Tugagan'],
  ].filter(([, v]) => v);
  return `<div class="product-specs-section"><h3 class="section-title">Xususiyatlari</h3>
    <div class="specs-list">
      ${rows.map(([l, v]) => `<div class="spec-item"><span class="spec-label">${esc(l)}</span><span class="spec-value">${esc(String(v))}</span></div>`).join('')}
    </div></div>`;
}

function reviewsSummary(reviews) {
  if (!config.features.reviews || !product.rating) return '';
  const link = `product-reviews.html?id=${encodeURIComponent(product.id)}`;
  return `<div class="reviews-section">
    <div class="reviews-header"><h3 class="section-title" style="margin:0">Mijozlar fikri</h3>
      <a class="see-all" href="${link}">Barchasi ›</a></div>
    <div class="rev-summary">
      <div style="text-align:center"><div class="rev-summary__num">${product.rating.toFixed(1)}</div>
        <div class="rev-summary__stars">${starRow(product.rating)}</div></div>
      <div class="rev-summary__count">${t('product.reviews', { count: product.reviewCount })}<br>
        <a class="see-all" href="${link}">Sharh yozish</a></div>
    </div>
    ${reviews.slice(0, 1).map((r) => `<div class="review-item">
      <div class="review-header"><div class="reviewer-info"><span class="reviewer-name">${esc(r.author)}</span>
        <div class="review-rating">${starRow(r.rating)}</div></div></div>
      <div class="review-comment">${esc(r.body)}</div></div>`).join('')}
  </div>`;
}

function updateTotals() {
  if (!hasPrice(product)) return;
  const unit = product.price;
  const u = document.getElementById('unitPriceDisplay'); if (u) u.textContent = formatPrice(unit);
  const totalEl = document.getElementById('totalPriceDisplay'); if (totalEl) totalEl.textContent = formatPrice(unit * qty);
  const cq = document.getElementById('cartQuantity'); if (cq) cq.textContent = `Soni: ${qty}`;
  const ct = document.getElementById('cartTotal'); if (ct) ct.textContent = formatPrice(unit * qty);
}

function render(reviews, related) {
  document.getElementById('appbar').innerHTML = `<header class="product-header"><div class="header-top">
    <a class="back-button" href="catalog.html" aria-label="Orqaga">${icon('back', { size: 24 })}</a>
    <div class="header-center"><h1 class="page-title">Mahsulot</h1></div>
    <button class="share-button" id="shareBtn" aria-label="Ulashish">${icon('send', { size: 22 })}</button>
  </div></header>`;
  bindThemeToggle();

  const priced = hasPrice(product);
  const discount = priced && product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

  screen.innerHTML = `<div class="product-content">
    ${gallery()}
    <div class="product-info-section">
      ${categoryName ? `<div class="product-type-badge physical">${esc(categoryName)}</div>` : ''}
      <h1 class="product-name">${esc(product.name)}</h1>
      ${config.features.ratings && product.rating ? `<div class="product-rating"><div class="rating-stars">${starRow(product.rating)}</div>
        <span class="rating-text">${product.rating} (${product.reviewCount} ta sharh)</span></div>` : ''}
      ${priced ? `<div class="product-price"><span class="current-price">${formatPrice(product.price)}</span>
        ${product.compareAtPrice ? `<span class="original-price">${formatPrice(product.compareAtPrice)}</span><span class="discount-badge">-${discount}%</span>` : ''}</div>`
        : `<div class="product-price">${askPriceButton(product.id, 'ask-price--lg')}</div>`}
      <div class="product-availability">
        ${product.inStock ? '<span class="availability-status in-stock">✓ Mavjud</span>' : '<span class="availability-status out-of-stock">✗ Tugagan</span>'}
        ${product.inStock && product.stock <= 20 ? `<span class="stock-count">${product.stock} ta qoldi</span>` : ''}</div>
      ${product.shortDescription ? `<p class="product-short">${esc(product.shortDescription)}</p>` : ''}
      <div class="product-inline-actions">
        <button class="chip" id="shareChip">${icon('send', { size: 14 })} Ulashish</button>
        ${config.brand.telegram ? `<a class="chip" href="https://t.me/${esc(config.brand.telegram.replace('@', ''))}" target="_blank" rel="noopener">💬 Savol berish</a>` : ''}
      </div>
    </div>

    ${priced || product.variants?.length ? `<div class="purchase-options-section">
      ${variantsSection()}
      ${priced ? `<div class="custom-quantity-section">
        <h4 class="option-title">Soni</h4>
        <div class="quantity-input-container">
          <button class="quantity-btn-large" id="qDec" aria-label="Kamaytirish">−</button>
          <input type="number" class="quantity-input" id="qInput" value="1" min="1" inputmode="numeric">
          <button class="quantity-btn-large" id="qInc" aria-label="Ko'paytirish">+</button>
        </div>
        <div class="quantity-price-display">
          <span class="unit-price">Narxi: <span id="unitPriceDisplay"></span></span>
          <span class="total-price">Jami: <span id="totalPriceDisplay"></span></span>
        </div>
      </div>` : ''}
    </div>` : ''}

    ${infoBlock(t('product.description'), product.description)}
    ${infoBlock('Tarkibi', product.ingredients)}
    ${infoBlock("Qo'llash usuli", product.usage)}
    ${specs()}
    ${bundleSection(related)}
    ${reviewsSummary(reviews)}

    ${related.length ? `<div class="related-products-section"><h3 class="section-title">${t('product.related')}</h3>
      <div class="related-products-grid">${related.map(productCard).join('')}</div></div>` : ''}
  </div>`;

  const wished = dataService.isWished(product.id);
  document.getElementById('bottombar').innerHTML = `<div class="bottom-action-bar">
    <button class="favorite-btn${wished ? ' is-wished' : ''}" id="favBtn" aria-label="Sevimlilar">${icon('heart', { size: 24, filled: wished })}</button>
    ${priced ? `<div class="cart-summary"><div class="cart-quantity" id="cartQuantity">Soni: 1</div><div class="cart-total" id="cartTotal">${formatPrice(product.price)}</div></div>` : ''}
    ${!priced
      ? `<button class="add-to-cart-btn" id="askBtn">${icon('send', { size: 20 })} Narxni bilish</button>`
      : product.inStock
        ? `<button class="add-to-cart-btn" id="addBtn">${icon('cart', { size: 20 })} Savatga</button>`
        : `<button class="add-to-cart-btn" id="notifyBtn">${icon('bell', { size: 20 })} Xabar berish</button>`}
  </div>`;

  updateTotals();
  wire();
}

function wire() {
  screen.querySelectorAll('[data-thumb]').forEach((im) => im.addEventListener('click', () => setImage(+im.dataset.thumb)));
  screen.querySelectorAll('[data-ind]').forEach((d) => d.addEventListener('click', () => setImage(+d.dataset.ind)));
  screen.querySelectorAll('[data-variant]').forEach((b) => b.addEventListener('click', () => {
    screen.querySelectorAll('[data-variant]').forEach((x) => x.classList.remove('active'));
    b.classList.add('active'); variant = b.dataset.variant; haptic('selection');
  }));
  const input = document.getElementById('qInput');
  document.getElementById('qDec')?.addEventListener('click', () => setQty(qty - 1));
  document.getElementById('qInc')?.addEventListener('click', () => setQty(qty + 1));
  input?.addEventListener('change', () => setQty(parseInt(input.value, 10) || 1));
  document.getElementById('askBtn')?.addEventListener('click', () => askPrice(product));
  document.getElementById('addBtn')?.addEventListener('click', addToCart);
  document.getElementById('notifyBtn')?.addEventListener('click', notifyStock);
  document.getElementById('favBtn').addEventListener('click', toggleFav);
  document.getElementById('shareBtn')?.addEventListener('click', share);
  document.getElementById('shareChip')?.addEventListener('click', share);
  document.getElementById('bundleBtn')?.addEventListener('click', addBundle);
  bindWishButtons(screen); // o'xshash mahsulotlar kartalari
}

function share() {
  const text = `${product.name}${hasPrice(product) ? ` — ${formatPrice(product.price)}` : ''} | ${config.brand.name}`;
  const tg = window.Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(text)}`);
  } else if (navigator.share) {
    navigator.share({ title: product.name, text, url: location.href }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(location.href);
    toast('Havola nusxalandi');
  }
}

const NS = config.data.persistNamespace;
function recordRecentlyViewed(pid) {
  const k = `${NS}:recentlyViewed`;
  const list = JSON.parse(localStorage.getItem(k) || '[]').filter((x) => x !== pid);
  list.unshift(pid);
  localStorage.setItem(k, JSON.stringify(list.slice(0, 12)));
}
function notifyStock() {
  const k = `${NS}:stockAlerts`;
  const list = JSON.parse(localStorage.getItem(k) || '[]');
  if (!list.includes(product.id)) list.push(product.id);
  localStorage.setItem(k, JSON.stringify(list));
  haptic('success'); toast('Mahsulot kelganda sizga xabar beramiz', { kind: 'success' });
}

let bundleExtra = null;
function bundleSection(related) {
  bundleExtra = related.find((p) => p.inStock && hasPrice(p)) || null;
  if (!bundleExtra || !product.inStock || !hasPrice(product)) return '';
  const total = product.price + bundleExtra.price;
  return `<div class="product-specs-section"><h3 class="section-title">Ko'pincha birga olinadi</h3>
    <div class="bundle">
      <a class="bundle__item" href="product.html?id=${encodeURIComponent(product.id)}">
        <img src="${productImage(product)}" alt="" ${imgAttrs(product)}><span class="bundle__name">${esc(product.name)}</span>
        <span class="semibold">${formatPrice(product.price)}</span></a>
      <span class="bundle__plus">+</span>
      <a class="bundle__item" href="product.html?id=${encodeURIComponent(bundleExtra.id)}">
        <img src="${productImage(bundleExtra)}" alt="" ${imgAttrs(bundleExtra)}><span class="bundle__name">${esc(bundleExtra.name)}</span>
        <span class="semibold">${formatPrice(bundleExtra.price)}</span></a>
    </div>
    <button class="btn btn--block" id="bundleBtn" style="margin-top:12px">Ikkalasini savatga · ${formatPrice(total)}</button>
  </div>`;
}

function cartItem(p, extra = {}) {
  return {
    productId: p.id, variantId: null, name: p.name, price: p.price, type: p.type,
    image: p.image || null, emoji: p.emoji, color: p.color, ...extra,
  };
}
function addBundle() {
  [product, bundleExtra].filter(Boolean).forEach((p) => dataService.addToCart(cartItem(p)));
  haptic('success'); toast("Ikkala mahsulot savatga qo'shildi", { kind: 'success' });
}

function setImage(i) {
  document.getElementById('mainImage').src = images[i];
  screen.querySelectorAll('.thumbnail').forEach((im, j) => im.classList.toggle('active', j === i));
  screen.querySelectorAll('.indicator').forEach((d, j) => d.classList.toggle('active', j === i));
}
function setQty(n) {
  qty = Math.max(1, Math.min(config.commerce.maxQtyPerItem, n));
  document.getElementById('qInput').value = qty;
  updateTotals();
  haptic('light');
}
function addToCart() {
  const v = product.variants?.find((x) => x.id === variant);
  dataService.addToCart(cartItem(product, {
    variantId: variant, qty, meta: v ? { variant: v.label } : {},
  }));
  haptic('success'); toast("Savatga qo'shildi", { kind: 'success' });
}
function toggleFav() {
  const nowWished = dataService.toggleWishlist(product.id);
  const btn = document.getElementById('favBtn');
  btn.classList.toggle('is-wished', nowWished);
  btn.innerHTML = icon('heart', { size: 24, filled: nowWished });
  haptic(nowWished ? 'success' : 'light');
  toast(nowWished ? "❤️ Sevimlilarga qo'shildi" : 'Sevimlilardan olib tashlandi');
}

(async function init() {
  product = await dataService.getProduct(id);
  if (!product) {
    document.getElementById('appbar').innerHTML = `<header class="product-header"><div class="header-top">
      <a class="back-button" href="catalog.html">${icon('back', { size: 24 })}</a>
      <div class="header-center"><h1 class="page-title">Mahsulot</h1></div><span style="width:40px"></span></div></header>`;
    screen.innerHTML = `<div class="empty-state"><div class="empty-state__emoji">🧐</div><h3>Mahsulot topilmadi</h3>
      <a class="btn" href="catalog.html">${t('nav.catalog')}</a></div>`;
    return;
  }
  document.title = `${product.name} · ${config.brand.name}`;
  recordRecentlyViewed(product.id);
  variant = product.variants?.[0]?.id || null;
  images = productGallery(product);
  const [reviews, all, cats] = await Promise.all([
    dataService.getReviews(product.id),
    dataService.getProducts({ category: product.categoryId }),
    dataService.getCategories(),
  ]);
  categoryName = cats.find((c) => c.id === product.categoryId)?.name || '';
  let related = all.filter((p) => p.id !== product.id);
  if (related.length < 2) {
    const others = (await dataService.getProducts()).filter((p) => p.id !== product.id && !related.includes(p));
    related = [...related, ...others];
  }
  render(reviews, related.slice(0, 4));
})();
