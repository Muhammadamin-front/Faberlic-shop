/**
 * Nova Kit — App bootstrap
 * ========================
 * Import and call `bootstrap()` at the top of every page's script. It initialises the
 * Telegram adapter, applies the theme and language direction, and keeps the cart/wishlist
 * badges in sync. Returns nothing — pages then render their own content.
 */
import { config } from './config.js';
import { initTelegram, setBackButton } from './core/telegram.js';
import { applyTheme } from './core/theme.js';
import { applyDocumentDirection } from './i18n/index.js';
import { dataService, onStoreChange } from './core/store.js';
import { placeholder } from './core/ui.js';

export function bootstrap({ back = null } = {}) {
  initTelegram();
  bindImageFallback();
  applyTheme();
  applyDocumentDirection();
  if (back) setBackButton(() => { window.location.href = back; });
  syncBadges();
  onStoreChange(syncBadges);
  return { config, dataService };
}

/**
 * images/ papkada rasm hali yo'q bo'lsa, buzilgan rasm o'rniga chiroyli belgi ko'rsatamiz.
 * <img data-emoji="🌸" data-color="#F48FB1"> atributlari bo'lsa, o'shalar ishlatiladi.
 */
function bindImageFallback() {
  if (window.__imgFallback) return;
  window.__imgFallback = true;
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.fallen) return;
    img.dataset.fallen = '1';
    img.src = placeholder(img.dataset.emoji || '🌸', img.dataset.color || '#F48FB1');
  }, true);
}

/** Update cart / wishlist / orders badges wherever they appear. */
export function syncBadges() {
  const cartCount = dataService.cartCount();
  document.querySelectorAll('[data-badge="cart"]').forEach((el) => {
    el.textContent = cartCount;
    el.classList.toggle('hidden', cartCount === 0);
  });
  setTabBadge('wishlist', dataService.getWishlist().length);
  setTabBadge('orders', dataService.getOrders().filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length);
}

function setTabBadge(tab, n) {
  document.querySelectorAll(`[data-tab-badge="${tab}"]`).forEach((el) => {
    el.textContent = n;
    el.classList.toggle('hidden', n === 0);
  });
}

export default bootstrap;
