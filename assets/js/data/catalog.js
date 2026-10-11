/**
 * Faberlic — Mahsulotlar katalogi
 * ===============================
 * Kategoriyalar va mahsulotlar shu yerda. Yangi mahsulot qo'shish uchun `products`
 * ro'yxatiga yangi obyekt qo'shing (pastdagi namunalarni nusxalang).
 *
 * RASMLAR: faylni `images/` papkaga qo'ying va `image` ga yo'lini yozing.
 *   Bir nechta rasm bo'lsa — qo'shimchalarini `gallery: [...]` ga yozing.
 * NARX: `price: 35000`. Narx noma'lum bo'lsa `price: null` — o'rniga "Narxni bilish"
 *   tugmasi chiqadi va mijoz adminga (config.brand.telegram) yozadi.
 * ESKI NARX: `compareAtPrice` — chizilgan eski narx (chegirma ko'rsatiladi), yo'q bo'lsa null.
 */

export const categories = [
  { id: 'yuz', name: 'Yuz parvarishi', icon: '🌸',
    subcategories: [{ id: 'yuz-krem', name: 'Yuz kremlari' }] },
  { id: 'tana', name: 'Tana parvarishi', icon: '🧴',
    subcategories: [
      { id: 'dush', name: 'Dush gellari' },
      { id: 'tana-krem', name: 'Kremlar va balzamlar' },
      { id: 'skrab-sovun', name: 'Skrab va sovun' },
    ] },
  { id: 'atir', name: 'Atirlar', icon: '🌷',
    subcategories: [{ id: 'atir-suvi', name: 'Atir suvlari' }] },
  { id: 'dezodorant', name: 'Dezodorantlar', icon: '💧',
    subcategories: [{ id: 'roll-on', name: 'Sharikli dezodorantlar' }] },
  { id: 'makiyaj', name: 'Makiyaj', icon: '💄',
    subcategories: [
      { id: 'lab', name: 'Lab uchun' },
      { id: 'koz', name: "Ko'z uchun" },
    ] },
  { id: 'erkak', name: 'Erkaklar uchun', icon: '🧔',
    subcategories: [
      { id: 'soqol', name: 'Soqol olish' },
      { id: 'erkak-gigiyena', name: 'Gigiyena' },
    ] },
];

export const products = [
  /* ---- Yuz parvarishi ---- */
  {
    id: 'p-rodiola-krem', name: 'Rodiola va bioretinol yuz kremi 2 in 1 «Lifting va oziqlantirish»',
    type: 'physical', categoryId: 'yuz', subcategoryId: 'yuz-krem',
    price: 35000, compareAtPrice: null, inStock: true, stock: 50, badges: ['Xit'],
    image: "images/35000 so'm.jpg",
    emoji: '🌸', color: '#F48FB1',
    volume: '100 ml', skinType: 'Yetuk va charchagan teri',
    shortDescription: 'Teri elastikligini oshiradi va chuqur oziqlantiradi.',
    description: "Rodiola ekstrakti va bioretinol bilan 2 in 1 krem: kunduzgi va tungi parvarish uchun bitta vosita. Teri tarangligini oshiradi, mayda ajinlarni silliqlaydi va terini oziqlantiradi.",
    ingredients: 'Rodiola ekstrakti, bioretinol',
    usage: 'Ertalab va kechqurun tozalangan yuz va bo\'yin terisiga surting.',
    variants: [],
  },
  {
    id: 'p-aloe-krem', name: 'Aloe va mochevina yuz kremi 2 in 1 «Super namlash va tiklash»',
    type: 'physical', categoryId: 'yuz', subcategoryId: 'yuz-krem',
    price: 35000, compareAtPrice: null, inStock: true, stock: 50, badges: ['Xit'],
    image: "images/35000 so'm 2.jpg",
    emoji: '🍃', color: '#81C784',
    volume: '100 ml', skinType: 'Quruq va suvsizlangan teri',
    shortDescription: 'Kun bo\'yi namlik va terini tiklash.',
    description: "Aloe vera va mochevina bilan 2 in 1 krem terini chuqur namlaydi, quruqlik va tortilish hissini yo'qotadi, himoya qatlamini tiklaydi.",
    ingredients: 'Aloe vera, mochevina',
    usage: 'Ertalab va kechqurun tozalangan teriga surting.',
    variants: [],
  },

  /* ---- Tana parvarishi ---- */
  {
    id: 'p-love-krem', name: 'L.ove universal krem 3 in 1 (yuz, qo\'l va tana uchun)',
    type: 'physical', categoryId: 'tana', subcategoryId: 'tana-krem',
    price: 47000, compareAtPrice: null, inStock: true, stock: 50, badges: ['Yangi'],
    image: 'images/47000 2-rasm.jpg',
    gallery: ["images/47000 so'm.jpg", 'images/47000 3-rasm.jpg'],
    emoji: '🐑', color: '#81D4FA',
    volume: '100 ml', skinType: 'Quruq teri · kattalar va 4 yoshdan bolalar',
    shortDescription: 'Lanolin bilan intensiv oziqlantiradi va namlaydi.',
    description: "Butun oila uchun universal krem: yuz, qo'l va tana terisiga mos. Lanolin terini oziqlantiruvchi moddalar bilan to'yintiradi va quruq joylarni namlaydi. Kattalar va 4 yoshdan oshgan bolalar uchun tavsiya etiladi.",
    ingredients: 'Lanolin',
    usage: 'Kerak bo\'lganda quruq joylarga surting.',
    variants: [],
  },
  {
    id: 'p-tovon-balzam', name: 'Expert Pharma «Silliq tovonlar XXL» oyoq balzami',
    type: 'physical', categoryId: 'tana', subcategoryId: 'tana-krem',
    price: 45000, compareAtPrice: null, inStock: true, stock: 50, badges: [],
    image: "images/45000 so'm.jpg",
    emoji: '🦶', color: '#EF9A9A',
    volume: '', skinType: "Dag'al tovon terisi",
    shortDescription: "Dag'al tovon terisini yumshatadi va silliqlaydi.",
    description: "Expert Pharma seriyasidagi oyoq balzami dag'al va yorilgan tovon terisini yumshatadi, silliq va parvarishlangan ko'rinish beradi.",
    ingredients: '',
    usage: 'Kechqurun toza va quruq oyoqlarga surting.',
    variants: [],
  },
  {
    id: 'p-storie-gel', name: "Storie d'Amore Fleur Hypnotique parfyumlangan dush geli",
    type: 'physical', categoryId: 'tana', subcategoryId: 'dush',
    price: 60000, compareAtPrice: null, inStock: true, stock: 50, badges: ['Xit'],
    image: "images/60000 so'm.jpg",
    emoji: '💗', color: '#F06292',
    volume: '', skinType: 'Barcha teri turlari',
    shortDescription: 'Gulli atir hidi bilan nozik dush geli.',
    description: "Storie d'Amore seriyasidagi parfyumlangan dush geli terini yumshoq tozalaydi va unda uzoq saqlanadigan nozik gulli hid qoldiradi.",
    ingredients: '',
    usage: "Nam teriga surting, ko'pirtiring va suv bilan yuving.",
    variants: [],
  },
  {
    id: 'p-aromio-gel', name: 'Aromio Pink Orchid parfyumlangan dush geli',
    type: 'physical', categoryId: 'tana', subcategoryId: 'dush',
    price: 60900, compareAtPrice: 123000, inStock: true, stock: 50, badges: ['Chegirma'],
    image: 'images/narxi rasmda.jpg',
    emoji: '🌺', color: '#BA68C8',
    volume: '400 ml', skinType: 'Barcha teri turlari',
    shortDescription: 'Pushti orxideya hidi bilan katta hajmli dush geli.',
    description: 'Aromio by Faberlic seriyasidagi parfyumlangan dush geli. Pushti orxideya hidi terida uzoq saqlanadi.',
    ingredients: '',
    usage: "Nam teriga surting, ko'pirtiring va suv bilan yuving.",
    sku: '3622',
    variants: [],
  },
  {
    id: 'p-aromio-skrab', name: 'Aromio Pink Orchid parfyumlangan tuzli tana skrabi',
    type: 'physical', categoryId: 'tana', subcategoryId: 'skrab-sovun',
    price: 81900, compareAtPrice: 164000, inStock: true, stock: 50, badges: ['Chegirma'],
    image: 'images/narxi rasmda.jpg',
    emoji: '🧂', color: '#A1887F',
    volume: '300 g', skinType: 'Barcha teri turlari',
    shortDescription: "Nozik tozalaydi, argan va kokos yog'lari bilan.",
    description: "Tuzli skrab terini nozik tozalaydi. Argan va kokos yog'lari terini silliq va baxmaldek qiladi. Yaltiroq (shimmer) teksturali.",
    ingredients: "Dengiz tuzi, argan yog'i, kokos yog'i",
    usage: "Haftasiga 1–2 marta nam teriga massaj qilib surting va yuving.",
    sku: '3632',
    variants: [],
  },
  {
    id: 'p-vitamania-sovun', name: 'Vitamania qattiq sovun (2 × 42 g)',
    type: 'physical', categoryId: 'tana', subcategoryId: 'skrab-sovun',
    price: 22000, compareAtPrice: 40900, inStock: true, stock: 50, badges: ['Chegirma'],
    image: "images/22000 so'm.jpg",
    emoji: '🍉', color: '#FF8A65',
    volume: '2 × 42 g', skinType: 'Barcha teri turlari',
    shortDescription: 'Mevali hidli vitaminli sovun.',
    description: "Vitamania seriyasidagi qattiq sovun — terini tetiklashtiruvchi mevali hid bilan. Ta'mlar: «Ananas va laym», «Mango va papayya», «Tarvuz va qovun».",
    ingredients: '',
    usage: "Nam teriga ko'pirtirib surting va yuving.",
    variants: [
      { id: 'ananas', label: 'Ananas va laym' },
      { id: 'mango', label: 'Mango va papayya' },
      { id: 'tarvuz', label: 'Tarvuz va qovun' },
    ],
  },

  /* ---- Atirlar ---- */
  {
    id: 'p-aromania', name: 'Aromania ayollar atir suvi',
    type: 'physical', categoryId: 'atir', subcategoryId: 'atir-suvi',
    price: 84900, compareAtPrice: 164000, inStock: true, stock: 50, badges: ['Chegirma'],
    image: 'images/narxi rasmdaa.jpg',
    gallery: ['images/narxi rasmdaaa.jpg'],
    emoji: '🌷', color: '#F8BBD0',
    volume: '30 ml', skinType: '',
    shortDescription: "Mevali va gulli hidlar — alohida yoki aralashtirib ishlating.",
    description: "Aromania — ayollar uchun yengil atir suvlari to'plami. Hidlarni alohida ishlating yoki bir-biriga qo'shib, o'zingizning noyob kombinatsiyangizni yarating.",
    ingredients: '',
    usage: "Bilak va bo'yin sohasiga sepiladi.",
    variants: [
      { id: 'qovun', label: 'Qovun (3072)' },
      { id: 'oq-choy', label: 'Oq choy (3042)' },
      { id: 'bergamot', label: 'Bergamot (3012)' },
      { id: 'orik', label: "O'rik (3074)" },
      { id: 'olma', label: 'Olma (3028)' },
      { id: 'malina', label: 'Malina (3073)' },
    ],
  },

  /* ---- Dezodorantlar ---- */
  {
    id: 'p-aromio-deo', name: 'Aromio Pink Orchid parfyumlangan dezodorant',
    type: 'physical', categoryId: 'dezodorant', subcategoryId: 'roll-on',
    price: 36900, compareAtPrice: 67900, inStock: true, stock: 50, badges: ['Chegirma'],
    image: 'images/narxi rasmda.jpg',
    emoji: '🌸', color: '#CE93D8',
    volume: '50 ml', skinType: '',
    shortDescription: "24 soatgacha himoya. Alyuminiy tuzlari va spirtsiz.",
    description: "Yoqimsiz hiddan 24 soatgacha himoya qiladi. Tarkibida alyuminiy tuzlari va spirt yo'q.",
    ingredients: 'Alyuminiy tuzlari va spirtsiz',
    usage: 'Toza va quruq teriga surting.',
    sku: '3631',
    variants: [],
  },
  {
    id: 'p-pharma-deo', name: 'Expert Pharma alyuminiy tuzlarisiz oqartiruvchi dezodorant',
    type: 'physical', categoryId: 'dezodorant', subcategoryId: 'roll-on',
    price: 50000, compareAtPrice: null, inStock: true, stock: 50, badges: [],
    image: "images/50000 so'M.jpg",
    emoji: '🤍', color: '#E57373',
    volume: '', skinType: 'Sezgir teri',
    shortDescription: 'Teri rangini yorqinlashtiruvchi effekt bilan.',
    description: "Expert Pharma seriyasidagi sharikli dezodorant. Alyuminiy tuzlarisiz, qo'ltiq osti terisini yorqinlashtiruvchi effektga ega.",
    ingredients: 'Alyuminiy tuzlarisiz',
    usage: 'Toza va quruq teriga surting.',
    variants: [],
  },

  /* ---- Makiyaj ---- */
  {
    id: 'p-glam-liner', name: 'Glam Liner matli lab qalami',
    type: 'physical', categoryId: 'makiyaj', subcategoryId: 'lab',
    price: 26000, compareAtPrice: null, inStock: true, stock: 50, badges: ['Yangi'],
    image: "images/26000 so'm.jpg",
    emoji: '💋', color: '#D81B60',
    volume: '', skinType: '',
    shortDescription: 'Matli lab qalami — 7 xil tus.',
    description: "Glam Liner — lab konturini aniq chizish uchun matli qalam. Yumshoq yoziladi va uzoq saqlanadi.",
    ingredients: '',
    usage: "Lab konturini chizing yoki butun labni bo'yang.",
    variants: ['41236', '41237', '41131', '41132', '41133', '41134', '41135'].map((c) => ({ id: c, label: c })),
  },
  {
    id: 'p-eyeliner', name: 'Longwear Eyeliner ko\'z podvodkasi',
    type: 'physical', categoryId: 'makiyaj', subcategoryId: 'koz',
    price: 45000, compareAtPrice: null, inStock: true, stock: 50, badges: [],
    image: "images/45000 so'm padvodka.jpg",
    emoji: '👁️', color: '#424242',
    volume: '', skinType: '',
    shortDescription: 'Uzoq saqlanadigan, aniq chiziqli podvodka.',
    description: "Longwear Eyeliner — ingichka uchli flomaster-podvodka. Aniq va to'yingan chiziq chizadi, kun bo'yi saqlanadi.",
    ingredients: '',
    usage: "Kiprik o'sish chizig'i bo'ylab chiziq torting.",
    variants: [],
  },

  /* ---- Erkaklar uchun (8 Element) ---- */
  {
    id: 'p-8el-shampun', name: '8 Element parfyumlangan shampun-dush geli 3 in 1',
    type: 'physical', categoryId: 'erkak', subcategoryId: 'erkak-gigiyena',
    price: 100000, compareAtPrice: null, inStock: true, stock: 50, badges: [],
    image: 'images/100 ming so\'m.jpg',
    emoji: '🧴', color: '#64B5F6',
    volume: '', skinType: 'Erkaklar uchun',
    shortDescription: 'Soch, tana va yuz uchun bitta vosita.',
    description: "8 Element For Men — erkaklar uchun parfyumlangan shampun-dush geli 3 in 1. Soch va tanani tozalaydi, tetiklantiruvchi hid qoldiradi.",
    ingredients: '',
    usage: "Nam soch va tanaga surting, ko'pirtiring va yuving.",
    variants: [],
  },
  {
    id: 'p-8el-shampun-2', name: '8 Element shampun-dush geli 3 in 1 (2 dona)',
    type: 'physical', categoryId: 'erkak', subcategoryId: 'erkak-gigiyena',
    price: null, compareAtPrice: null, inStock: true, stock: 50, badges: [],
    image: "images/narx yo'q.jpg",
    emoji: '🧴', color: '#64B5F6',
    volume: '2 dona', skinType: 'Erkaklar uchun',
    shortDescription: "Narxini admin orqali bilib oling.",
    description: "8 Element For Men parfyumlangan shampun-dush geli 3 in 1 — do'konimizda mavjud. Narxi va mavjud miqdorini bilish uchun «Narxni bilish» tugmasini bosing.",
    ingredients: '',
    usage: "Nam soch va tanaga surting, ko'pirtiring va yuving.",
    variants: [],
  },
  {
    id: 'p-8el-gel', name: '8 Element soqol olish geli',
    type: 'physical', categoryId: 'erkak', subcategoryId: 'soqol',
    price: 35000, compareAtPrice: null, inStock: true, stock: 50, badges: [],
    image: "images/35 ming so'm.jpg",
    emoji: '🪒', color: '#5C6BC0',
    volume: '', skinType: 'Erkaklar uchun',
    shortDescription: 'Silliq va qulay soqol olish uchun.',
    description: "8 Element For Men soqol olish geli ustara sirpanishini yaxshilaydi va terini ta'sirlanishdan himoya qiladi.",
    ingredients: '',
    usage: "Nam teriga surting, ko'pirtiring va soqol oling.",
    variants: [],
  },
  {
    id: 'p-8el-balzam', name: '8 Element soqol olishdan keyingi balzam',
    type: 'physical', categoryId: 'erkak', subcategoryId: 'soqol',
    price: 35000, compareAtPrice: null, inStock: true, stock: 50, badges: [],
    image: "images/35 ming so'm 2.jpg",
    emoji: '🧔', color: '#3949AB',
    volume: '', skinType: 'Erkaklar uchun',
    shortDescription: 'Soqoldan keyin terini tinchlantiradi.',
    description: "8 Element For Men balzami soqol olishdan keyin terini tinchlantiradi, namlaydi va qizarishni kamaytiradi.",
    ingredients: '',
    usage: 'Soqol olgandan keyin yuz terisiga surting.',
    variants: [],
  },
  {
    id: 'p-8el-deo', name: '8 Element dezodorant-antiperspirant',
    type: 'physical', categoryId: 'erkak', subcategoryId: 'erkak-gigiyena',
    price: 38000, compareAtPrice: null, inStock: true, stock: 50, badges: [],
    image: "images/38000 so'm.jpg",
    emoji: '💧', color: '#1E88E5',
    volume: '', skinType: 'Erkaklar uchun',
    shortDescription: 'Ter va hiddan ishonchli himoya.',
    description: "8 Element For Men sharikli dezodorant-antiperspirant kun bo'yi ter va yoqimsiz hiddan himoya qiladi.",
    ingredients: '',
    usage: 'Toza va quruq teriga surting.',
    variants: [],
  },
];

/** Narxi ma'lum emasmi? (price: null) — "Narxni bilish" tugmasi ko'rsatiladi. */
export const hasPrice = (p) => typeof p?.price === 'number' && p.price > 0;

// Subkategoriya bo'yicha mahsulotlar sonini hisoblash
for (const c of categories) {
  for (const s of c.subcategories || []) {
    s.count = products.filter((p) => p.subcategoryId === s.id).length;
  }
}

export default { categories, products };
