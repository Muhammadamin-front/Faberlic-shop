# Faberlic — Telegram Mini App do'koni

Telegram ichida ishlaydigan kosmetika do'koni: katalog, qidiruv, sevimlilar, savat, promo-kodlar,
buyurtma berish. Buyurtmalar **Telegram bot orqali sizga xabar bo'lib keladi**.

Asos: [Nova Store UI kit](https://github.com/unusdon/nova-store-telegram-mini-app) (litsenziya — `LICENSE`).

## 1. Kompyuterda ishga tushirish

Node.js 18+ kerak (https://nodejs.org).

```bash
node serve.js
```

yoki `START-SERVER.command` faylini ikki marta bosing. Brauzerda oching: http://localhost:8000

## 2. Buyurtmalar Telegramga kelishi uchun

1. Telegramda **@BotFather** → `/newbot` → bot yarating va **tokenni** oling.
2. **@userinfobot** ga `/start` yozing — u sizning **chat ID** ingizni beradi.
3. Botingizga bir marta `/start` yozing (aks holda bot sizga yoza olmaydi).
4. `.env.example` faylini `.env` deb nusxalang va to'ldiring:
   ```
   BOT_TOKEN=123456789:AA...
   ADMIN_CHAT_ID=123456789
   ```
   Buyurtmalar guruhga kelsin desangiz — botni guruhga qo'shing va guruh ID sini yozing (`-100...`).
   Bir nechta odamga: `ADMIN_CHAT_ID=111,222`.
5. Serverni qayta ishga tushiring.

> `.env` faylini hech kimga bermang va GitHub ga yuklamang (`.gitignore` da bor).

## 3. Internetga chiqarish va botga ulash

Telegram Mini App faqat **HTTPS** manzilda ishlaydi.

- **Sinab ko'rish uchun:** `npx ngrok http 8000` — bergan `https://...` manzilni ishlating.
- **Doimiy:** Node.js qo'llab-quvvatlaydigan hostingga yuklang (Render, Railway, VPS va h.k.),
  start buyrug'i `node serve.js`, `BOT_TOKEN` va `ADMIN_CHAT_ID` ni hosting sozlamalarida kiriting.

So'ng **@BotFather** → `/mybots` → botingiz → **Bot Settings → Menu Button** → HTTPS manzilni kiriting.
Endi botdagi menyu tugmasi do'konni ochadi.

## 4. Do'konni tahrirlash

| Nima | Qayerda |
|---|---|
| Telefon, Telegram manzil, shahar, nom | `assets/js/config.js` → `brand` |
| Yetkazib berish narxi, bepul yetkazish chegarasi, promo-kodlar | `assets/js/config.js` → `commerce` |
| To'lov usullari | `assets/js/config.js` → `payments.methods` |
| Mahsulotlar va kategoriyalar | `assets/js/data/catalog.js` |
| Ranglar | `assets/css/tokens.css` |

**Yangi mahsulot qo'shish:** rasmni `images/` ga tashlang, `catalog.js` dagi istalgan mahsulotni
nusxalab, `id` (takrorlanmas), `name`, `price`, `image` ni o'zgartiring.

- Narx noma'lum bo'lsa `price: null` — o'rniga **«Narxni bilish»** tugmasi chiqadi va mijoz
  `config.brand.telegram` dagi manzilga yozadi.
- Chegirma: `compareAtPrice` ga eski narxni yozing.
- Bir nechta rasm: `gallery: ['images/2.jpg', 'images/3.jpg']`.
- Tugagan mahsulot: `inStock: false`.

## Eslatmalar

- Buyurtma holati (Tasdiqlandi / Yo'lda / Yetkazildi) hozircha mijoz telefonida «Qabul qilindi»
  bo'lib qoladi — buyurtmani operator Telegram orqali tasdiqlaydi.
- Mijoz savati, sevimlilari va buyurtmalar tarixi uning qurilmasida saqlanadi.
# Faberlic-shop
