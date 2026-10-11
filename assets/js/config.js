/**
 * Faberlic — Asosiy sozlamalar
 * ============================
 * Do'konni o'zingizga moslash uchun asosan shu faylni tahrirlaysiz: nom, ranglar, valyuta,
 * yetkazib berish narxi, promo-kodlar, to'lov usullari, menyu va buyurtma qabul qilish.
 *
 * Sahifalarning hech biri bu qiymatlarni qattiq yozmaydi — hammasi shu yerdan o'qiladi.
 * Ranglar `assets/css/tokens.css` faylida ham bor; pastdagi `theme` bloki ularni ustidan yozadi.
 *
 * Asos: Nova Store UI kit (unusdon).
 */

export const config = {
  /* ---- Brend -------------------------------------------------------------------------- */
  brand: {
    name: 'Faberlic',
    shortName: 'Faberlic',
    tagline: 'Ayollar uchun parvarish kremlari',
    logoEmoji: '🌸',
    logoSvg: null,             // o'z logotipingiz: '<svg ...>...</svg>' yoki '<img src="images/logo.png">'
    author: 'Faberlic',
    supportUrl: '',            // masalan: 'https://t.me/faberlic_admin'
    phone: '+998994345432',// mijozlar qo'ng'iroq qiladigan raqam
    telegram: '@vocorateam', // savollar uchun Telegram manzil
    city: 'Toshkent',
  },

  /* ---- Mavzu (ranglar) ---------------------------------------------------------------- */
  theme: {
    colorScheme: 'light',      // 'auto' | 'light' | 'dark'
    allowUserToggle: true,     // yorug'/qorong'i rejim tugmasini ko'rsatish
    accent: null,              // tokens.css dagi pushti rang ishlatiladi; o'zgartirish uchun hex bering
    accentContrast: null,
    radius: 16,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    // Telegram mavzusi ranglari brend rangini bosib ketmasligi uchun o'chirilgan.
    followTelegramTheme: false,
  },

  /* ---- Til ---------------------------------------------------------------------------- */
  locale: {
    default: 'uz',
    available: ['uz'],
    rtlLocales: [],
  },

  /* ---- Valyuta ------------------------------------------------------------------------ */
  currency: {
    code: 'UZS',
    symbol: " so'm",
    position: 'after',         // 125 000 so'm
    decimals: 0,
    thousands: ' ',
    decimal: ',',
  },

  /* ---- Savdo qoidalari ---------------------------------------------------------------- */
  commerce: {
    taxRate: 0,                // QQS narxga kiritilgan
    shippingFlat: 25000,       // yetkazib berish narxi
    expressShipping: 45000,    // tezkor (shu kuni) yetkazib berish
    freeShippingThreshold: 400000, // shu summadan yuqori buyurtmada yetkazib berish bepul (0 = o'chirish)
    maxQtyPerItem: 10,
    enablePromo: true,
    promoCodes: {
      GOZAL10:  { type: 'percentage', value: 10,    label: '10% chegirma' },
      BAHOR15:  { type: 'percentage', value: 15,    label: '15% bahorgi chegirma' },
      BEPUL:    { type: 'fixed',      value: 25000, label: 'Bepul yetkazib berish' },
    },
  },

  /* ---- Bo'limlarni yoqish/o'chirish --------------------------------------------------- */
  features: {
    onboarding: true,
    search: true,
    categories: true,
    wishlist: true,
    reviews: false,            // sharhlar (hozircha haqiqiy sharhlar yo'q)
    ratings: false,            // yulduzcha reytinglar
    promo: true,
    addresses: true,
    notifications: true,
    admin: false,              // admin panel yo'q: buyurtmalar Telegramga keladi
  },

  /* ---- To'lov usullari ---------------------------------------------------------------- *
   * Hammasi `manual` — buyurtma "kutilmoqda" holatida yaratiladi va sizga yuboriladi,
   * siz mijoz bilan bog'lanib to'lovni qabul qilasiz (naqd, Click, Payme yoki karta o'tkazma).
   * -------------------------------------------------------------------------------------- */
  payments: {
    methods: [
      { id: 'cod',   provider: 'manual', label: 'Naqd pul',            icon: '💵', enabled: true, note: 'Mahsulotni olganda to\'laysiz' },
      { id: 'click', provider: 'manual', label: 'Click',               icon: '🔵', enabled: true, note: 'Operator to\'lov havolasini yuboradi' },
      { id: 'payme', provider: 'manual', label: 'Payme',               icon: '🟢', enabled: true, note: 'Operator to\'lov havolasini yuboradi' },
      { id: 'card',  provider: 'manual', label: 'Kartaga o\'tkazma',   icon: '💳', enabled: true, note: 'Uzcard / Humo kartaga o\'tkazish' },
    ],
    providers: {},
    demoSimulate: true,
  },

  /* ---- Buyurtmalarni qabul qilish ----------------------------------------------------- *
   * Buyurtma berilganda u shu manzilga POST qilinadi. `node serve.js` serveri bu manzilni
   * qabul qilib, buyurtmani Telegram bot orqali sizga (ADMIN_CHAT_ID) yuboradi.
   * Bo'sh qoldirsangiz, buyurtma faqat mijoz telefonida saqlanadi.
   * -------------------------------------------------------------------------------------- */
  orders: {
    notifyUrl: '/api/order',
    numberPrefix: 'FB',
  },

  /* ---- Pastki menyu ------------------------------------------------------------------- */
  nav: {
    tabs: [
      { id: 'home',     label: 'Bosh sahifa', icon: 'home',    href: 'index.html' },
      { id: 'catalog',  label: 'Katalog',     icon: 'grid',    href: 'catalog.html' },
      { id: 'wishlist', label: 'Sevimlilar',  icon: 'heart',   href: 'wishlist.html' },
      { id: 'orders',   label: 'Buyurtmalar', icon: 'bag',     href: 'orders.html' },
      { id: 'profile',  label: 'Profil',      icon: 'user',    href: 'profile.html' },
    ],
  },

  /* ---- Ma'lumotlar manbai ------------------------------------------------------------- */
  data: {
    source: 'mock',            // 'mock' (assets/js/data/catalog.js) | 'api'
    apiBaseUrl: '',
    persistNamespace: 'faberlic',
  },

  /* ---- Telegram ----------------------------------------------------------------------- */
  telegram: {
    enabled: true,
    expand: true,
    haptics: true,
    closingConfirmation: false,
  },
};

export default config;
