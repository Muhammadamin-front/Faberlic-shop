/**
 * Faberlic — Ma'lumotlar xizmati va mahalliy holat (Nova Kit asosida)
 * =====================================
 * Pages talk to `dataService` (never to localStorage directly). The default is a MOCK
 * adapter backed by the bundled catalog + localStorage. To use a real backend, implement
 * the same methods against your API and switch `config.data.source` to 'api'.
 */
import { config } from '../config.js';
import { categories as demoCategories, products as demoProducts } from '../data/catalog.js';

// Narxsiz (price: null) mahsulotlar narx bo'yicha saralashda oxirga tushadi.
const priceOf = (p, empty) => (typeof p.price === 'number' ? p.price : empty);

const NS = config.data.persistNamespace;
const KEY = {
  cart:      `${NS}:cart`,
  orders:    `${NS}:orders`,
  wishlist:  `${NS}:wishlist`,
  addresses: `${NS}:addresses`,
};

/* ---- localStorage helpers ------------------------------------------------------------- */
function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('nova:store', { detail: { key } }));
}

/* ---- Mock adapter --------------------------------------------------------------------- */
const mockAdapter = {
  async getCategories() {
    return demoCategories;
  },

  async getProducts(query = {}) {
    let list = [...demoProducts];
    const { category, subcategory, type, search, sort } = query;
    if (category && category !== 'all') list = list.filter((p) => p.categoryId === category);
    if (subcategory && subcategory !== 'all') list = list.filter((p) => p.subcategoryId === subcategory);
    if (type && type !== 'all') list = list.filter((p) => p.type === type);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => [p.name, p.shortDescription, p.skinType, p.ingredients]
        .filter(Boolean).some((f) => f.toLowerCase().includes(q)));
    }
    switch (sort) {
      case 'price-asc':  list.sort((a, b) => priceOf(a, Infinity) - priceOf(b, Infinity)); break;
      case 'price-desc': list.sort((a, b) => priceOf(b, -1) - priceOf(a, -1)); break;
      case 'rating':     list.sort((a, b) => (b.badges?.length || 0) - (a.badges?.length || 0)); break;
      default: break; // 'newest' = catalog order
    }
    return list;
  },

  async getProduct(id) {
    return demoProducts.find((p) => p.id === id) || null;
  },

  async getFeatured() {
    return demoProducts.filter((p) => p.badges?.includes('Xit'));
  },

  async getReviews() {
    // Haqiqiy sharhlar hali yo'q. Backend ulanganda shu yerdan qaytaring.
    return [];
  },
};

/* ---- API adapter (template — wire to your backend) ------------------------------------ */
const apiAdapter = {
  async _get(path, params) {
    const url = new URL(config.data.apiBaseUrl + path);
    if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  },
  getCategories() { return this._get('/categories'); },
  getProducts(q)  { return this._get('/products', q); },
  getProduct(id)  { return this._get(`/products/${id}`); },
  getFeatured()   { return this._get('/products', { featured: true }); },
  getReviews(id)  { return this._get(`/products/${id}/reviews`); },
};

const remote = config.data.source === 'api' ? apiAdapter : mockAdapter;

/* ---- Public data service -------------------------------------------------------------- */
export const dataService = {
  // Catalogue (remote/mock)
  getCategories: (...a) => remote.getCategories(...a),
  getProducts:   (...a) => remote.getProducts(...a),
  getProduct:    (...a) => remote.getProduct(...a),
  getFeatured:   (...a) => remote.getFeatured(...a),
  getReviews:    (...a) => remote.getReviews(...a),

  // Cart (local)
  getCart() { return read(KEY.cart, []); },
  setCart(items) { write(KEY.cart, items); },
  cartCount() { return this.getCart().reduce((n, i) => n + i.qty, 0); },
  addToCart(item) {
    const cart = this.getCart();
    const match = cart.find((i) => i.productId === item.productId && i.variantId === item.variantId);
    if (match) match.qty = Math.min(config.commerce.maxQtyPerItem, match.qty + (item.qty || 1));
    else cart.push({ qty: 1, ...item });
    this.setCart(cart);
  },
  updateQty(index, qty) {
    const cart = this.getCart();
    if (!cart[index]) return;
    if (qty <= 0) cart.splice(index, 1);
    else cart[index].qty = Math.min(config.commerce.maxQtyPerItem, qty);
    this.setCart(cart);
  },
  clearCart() { this.setCart([]); },

  // Wishlist (local)
  getWishlist() { return read(KEY.wishlist, []); },
  isWished(id) { return this.getWishlist().includes(id); },
  toggleWishlist(id) {
    const list = this.getWishlist();
    const i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    write(KEY.wishlist, list);
    return i < 0; // true if now wished
  },

  // Orders (local)
  getOrders() { return read(KEY.orders, []); },
  placeOrder(payload) {
    const orders = this.getOrders();
    // Bir nechta mijozning raqamlari to'qnashmasligi uchun vaqtga asoslangan raqam.
    const number = `${config.orders?.numberPrefix || 'FB'}-${Date.now().toString().slice(-6)}`;
    const status = payload.paymentStatus === 'paid' ? 'paid' : 'pending';
    const order = {
      id: number, number, createdAt: new Date().toISOString(), status,
      timeline: [{ status, at: new Date().toISOString() }], ...payload,
    };
    orders.unshift(order);
    write(KEY.orders, orders);
    return order;
  },

  /**
   * Buyurtmani do'kon egasiga yuborish (`config.orders.notifyUrl`). serve.js uni Telegram
   * bot orqali adminga jo'natadi. Muvaffaqiyatli bo'lsa true qaytaradi.
   */
  async sendOrder(order) {
    const url = config.orders?.notifyUrl;
    if (!url || location.protocol === 'file:') return false;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, initData: window.Telegram?.WebApp?.initData || '' }),
      });
      if (!res.ok) return false;
      const body = await res.json().catch(() => ({}));
      return body.ok === true;
    } catch {
      return false;
    }
  },
  updateOrder(id, patch) {
    const orders = this.getOrders();
    const o = orders.find((x) => x.id === id);
    if (o) { Object.assign(o, patch); write(KEY.orders, orders); }
    return o;
  },

  // Addresses (local)
  getAddresses() { return read(KEY.addresses, []); },
  saveAddress(addr) {
    const list = this.getAddresses();
    if (addr.id) {
      const i = list.findIndex((a) => a.id === addr.id);
      if (i >= 0) list[i] = addr;
    } else {
      addr.id = `addr-${list.length + 1}-${Date.now().toString(36)}`;
      if (list.length === 0) addr.default = true;
      list.push(addr);
    }
    write(KEY.addresses, list);
    return addr;
  },
  deleteAddress(id) { write(KEY.addresses, this.getAddresses().filter((a) => a.id !== id)); },

  // Promo
  applyPromo(code) {
    if (!config.commerce.enablePromo) return null;
    const promo = config.commerce.promoCodes[String(code).trim().toUpperCase()];
    return promo ? { code: code.toUpperCase(), ...promo } : null;
  },
};

/**
 * Cart maths. Pass `shippingOverride` (a number) to use a chosen shipping rate instead of
 * the configured flat rate — e.g. when the customer selects express shipping at checkout.
 */
export function cartTotals(cart = dataService.getCart(), promo = null, shippingOverride = null) {
  const { taxRate, shippingFlat, freeShippingThreshold } = config.commerce;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const hasPhysical = cart.some((i) => i.type === 'physical');
  let discount = 0;
  if (promo) {
    discount = promo.type === 'percentage'
      ? subtotal * (promo.value / 100)
      : Math.min(promo.value, subtotal);
  }
  const baseShipping = shippingOverride != null ? shippingOverride : shippingFlat;
  let shipping = hasPhysical ? baseShipping : 0;
  if (freeShippingThreshold && subtotal >= freeShippingThreshold) shipping = 0;
  if (promo?.type === 'fixed' && promo.code === 'FREESHIP') shipping = 0;
  const tax = Math.max(0, subtotal - discount) * taxRate;
  const total = Math.max(0, subtotal - discount) + shipping + tax;
  return { subtotal, discount, shipping, tax, total };
}

/** Subscribe to store changes (cart/orders/wishlist/addresses). Returns an unsubscribe fn. */
export function onStoreChange(handler) {
  const fn = (e) => handler(e.detail?.key);
  window.addEventListener('nova:store', fn);
  return () => window.removeEventListener('nova:store', fn);
}

export default dataService;
