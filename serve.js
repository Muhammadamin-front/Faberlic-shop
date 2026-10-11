/*
 * Faberlic — server (statik fayllar + buyurtmalarni Telegramga yuborish)
 * =====================================================================
 * Ishga tushirish:  node serve.js
 *
 * Sozlamalar (muhit o'zgaruvchilari yoki shu papkadagi `.env` fayli):
 *   BOT_TOKEN      — @BotFather bergan bot tokeni
 *   ADMIN_CHAT_ID  — buyurtmalar keladigan chat ID (o'zingiz yoki guruh). Bir nechta bo'lsa vergul bilan.
 *   PORT           — port (standart 8000)
 *
 * Mini App ochilganda brauzer POST /api/order ga buyurtmani yuboradi; server uni chiroyli
 * xabar qilib ADMIN_CHAT_ID ga jo'natadi. Bot tokeni faqat serverda turadi — mijozga ko'rinmaydi.
 * Tashqi kutubxonalar kerak emas (Node.js 18+).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;

// ---- .env faylini o'qish (agar bor bo'lsa) ----
try {
  fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch { /* .env yo'q — muhit o'zgaruvchilaridan foydalanamiz */ }

const PORT = process.env.PORT || 8000;
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ADMIN_CHAT_IDS = String(process.env.ADMIN_CHAT_ID || '').split(',').map((s) => s.trim()).filter(Boolean);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain',
};
// Hech qachon brauzerga berilmaydigan fayllar.
const PRIVATE = new Set(['.env', 'serve.js', 'START-SERVER.command']);

/* ---------------------------------------------------------------- yordamchilar */
const escHtml = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const money = (n) => `${Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`;

/** Telegram initData imzosini tekshirish — buyurtma haqiqatan Telegram foydalanuvchisidan kelganmi. */
function verifyInitData(initData) {
  if (!initData || !BOT_TOKEN) return null;
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');
    const dataCheck = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n');
    const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const calc = crypto.createHmac('sha256', secret).update(dataCheck).digest('hex');
    if (!hash || calc.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) return null;
    return JSON.parse(params.get('user') || 'null');
  } catch { return null; }
}

function orderMessage(order, tgUser) {
  const a = order.address || {};
  const items = (Array.isArray(order.items) ? order.items : []).slice(0, 50).map((it, i) =>
    `${i + 1}. ${escHtml(it.name)}${it.meta?.variant ? ` (${escHtml(it.meta.variant)})` : ''} × ${Number(it.qty) || 1} — ${money((it.price || 0) * (it.qty || 1))}`).join('\n');
  const who = tgUser
    ? `\n👤 Telegram: ${escHtml([tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '))}${tgUser.username ? ` (@${escHtml(tgUser.username)})` : ''} ✅`
    : order.customer?.username ? `\n👤 Telegram: @${escHtml(order.customer.username)} (tasdiqlanmagan)` : '';
  const place = [a.region, a.city, a.line1].filter(Boolean).map(escHtml).join(', ');
  return [
    `🛍 <b>Yangi buyurtma ${escHtml(order.number)}</b>`,
    '',
    items,
    '',
    `Mahsulotlar: ${money(order.subtotal)}`,
    order.discount ? `Chegirma${order.promo?.code ? ` (${escHtml(order.promo.code)})` : ''}: −${money(order.discount)}` : null,
    `Yetkazish: ${order.shipping ? money(order.shipping) : 'bepul'} — ${escHtml(order.shippingMethod)}`,
    `<b>Jami: ${money(order.total)}</b>`,
    `To'lov: ${escHtml(order.paymentMethod)}`,
    '',
    `📇 ${escHtml(a.name)}`,
    `📞 ${escHtml(a.phone)}`,
    place ? `📍 ${place}${a.line2 ? ` (mo'ljal: ${escHtml(a.line2)})` : ''}` : '📍 Olib ketadi',
    order.notes ? `💬 ${escHtml(order.notes)}` : null,
    who || null,
  ].filter((l) => l !== null).join('\n').slice(0, 4000);
}

async function sendToAdmins(text) {
  const results = await Promise.all(ADMIN_CHAT_IDS.map(async (chatId) => {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!res.ok) console.error('  Telegram xatosi:', res.status, await res.text());
    return res.ok;
  }));
  return results.some(Boolean);
}

// Oddiy himoya: bitta IP dan daqiqasiga 10 tadan ortiq buyurtma qabul qilinmaydi.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now); hits.set(ip, list);
  return list.length > 10;
}

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function handleOrder(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  if (rateLimited(ip)) return json(res, 429, { ok: false, error: "Juda ko'p so'rov" });
  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk;
    if (raw.length > 100_000) { req.destroy(); }
  });
  req.on('end', async () => {
    try {
      const { order, initData } = JSON.parse(raw || '{}');
      if (!order || !order.number || !Array.isArray(order.items) || !order.items.length) {
        return json(res, 400, { ok: false, error: "Buyurtma noto'g'ri" });
      }
      const tgUser = verifyInitData(initData);
      const text = orderMessage(order, tgUser);
      console.log(`\n  ${new Date().toLocaleString()} — buyurtma ${order.number}, ${money(order.total)}`);
      if (!BOT_TOKEN || !ADMIN_CHAT_IDS.length) {
        console.log('  (BOT_TOKEN / ADMIN_CHAT_ID sozlanmagan — xabar faqat shu oynada)\n' + text.replace(/<[^>]+>/g, ''));
        return json(res, 200, { ok: false, error: 'Bot sozlanmagan' });
      }
      const ok = await sendToAdmins(text);
      json(res, ok ? 200 : 502, { ok });
    } catch (err) {
      console.error('  Buyurtmani qayta ishlashda xato:', err.message);
      json(res, 500, { ok: false });
    }
  });
}

/* ---------------------------------------------------------------- server */
http.createServer((req, res) => {
  const pathname = decodeURIComponent(req.url.split('?')[0]);

  if (pathname === '/api/order') {
    if (req.method === 'POST') return handleOrder(req, res);
    return json(res, 405, { ok: false });
  }

  let rel = pathname.endsWith('/') ? pathname + 'index.html' : pathname;
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT) || PRIVATE.has(path.basename(filePath)) || filePath.includes(`${path.sep}.`)) {
    res.writeHead(403); return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return fs.readFile(path.join(ROOT, 'not-found.html'), (e2, page) => {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(e2 ? '<h1 style="font-family:sans-serif">404</h1>' : page);
      });
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      // HTML/JS/CSS keshlanmaydi (o'zgarishlar darhol ko'rinadi), rasmlar 1 kun keshlanadi.
      'Cache-Control': ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? 'public, max-age=86400' : 'no-store',
    });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`\n  Faberlic do'koni  →  http://localhost:${PORT}`);
  console.log(BOT_TOKEN && ADMIN_CHAT_IDS.length
    ? `  Buyurtmalar Telegramga yuboriladi (${ADMIN_CHAT_IDS.length} ta chat).`
    : "  ⚠️  BOT_TOKEN va ADMIN_CHAT_ID sozlanmagan — buyurtmalar faqat shu oynada ko'rinadi (.env.example ga qarang).");
  console.log('  To\'xtatish: Ctrl+C\n');
});
