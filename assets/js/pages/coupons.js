/**
 * Faberlic — Promo-kodlar
 * Do'kondagi promo-kodlar (config.js dan) — nusxalab savatda qo'llash mumkin.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { icon } from '../core/icons.js';
import { esc, toast } from '../core/ui.js';
import { haptic } from '../core/telegram.js';
import { appBar, bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
const codes = Object.entries(config.commerce.promoCodes).map(([code, v]) => ({ code, ...v }));

document.getElementById('appbar').innerHTML = appBar({ title: 'Promo-kodlar', back: 'profile.html', themeToggle: true });
bindThemeToggle();

screen.innerHTML = codes.length ? `<div style="padding-top:8px">${codes.map((c) => `
  <div class="coupon-card">
    <span class="list-row__icon">${icon('tag', { size: 20 })}</span>
    <div class="coupon-card__body">
      <div class="semibold" style="font-family:ui-monospace,Menlo,Consolas,monospace;letter-spacing:0.08em">${esc(c.code)}</div>
      <div class="muted text-sm">${esc(c.label)}</div>
    </div>
    <button class="btn btn--sm" data-copy="${esc(c.code)}">Nusxalash</button>
  </div>`).join('')}</div>`
  : `<div class="empty-state"><div class="empty-state__emoji">🎟️</div><h3>Hozircha promo-kodlar yo'q</h3></div>`;

screen.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
  const code = b.getAttribute('data-copy');
  try { await navigator.clipboard.writeText(code); } catch { /* clipboard may be blocked */ }
  haptic('success'); toast(`${code} nusxalandi — savatda qo'llang`, { kind: 'success' });
}));
