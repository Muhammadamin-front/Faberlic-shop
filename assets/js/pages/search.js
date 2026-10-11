/**
 * Faberlic — Qidiruv
 * Jonli qidiruv, oxirgi qidiruvlar va tezkor takliflar.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { dataService } from '../core/store.js';
import { esc, toast } from '../core/ui.js';
import { appBar, productCard, bindWishButtons, bindThemeToggle } from '../components.js';

bootstrap();

const screen = document.getElementById('screen');
const recentKey = `${config.data.persistNamespace}:recent-search`;
let recent = JSON.parse(localStorage.getItem(recentKey) || '[]');
const suggestions = ['Krem', 'Serum', 'Niqob', 'Gialuron', 'SPF', "Qo'l kremi", 'Loson'];
let all = [];

function shell() {
  document.getElementById('appbar').innerHTML = appBar({ title: 'Qidiruv', back: 'index.html', themeToggle: true });
  bindThemeToggle();
  screen.innerHTML = `
    <div class="search-field">${icon('search', { size: 20 })}
      <input id="q" placeholder="${t('home.search_placeholder')}" autocomplete="off" autofocus>
      <button id="clr" aria-label="Tozalash" class="text-faint">${icon('close', { size: 18 })}</button>
    </div>
    <div id="results"></div>`;
  document.getElementById('q').addEventListener('input', (e) => run(e.target.value));
  document.getElementById('clr').addEventListener('click', () => { document.getElementById('q').value = ''; run(''); });
  run('');
}

function chips(title, list) {
  if (!list.length) return '';
  return `<div class="section-head"><h2>${title}</h2></div>
    <div class="search-tags">${list.map((s) => `<button class="chip" data-term="${esc(s)}">${esc(s)}</button>`).join('')}</div>`;
}

async function run(q) {
  const results = document.getElementById('results');
  if (!q.trim()) {
    results.innerHTML = chips('Oxirgi qidiruvlar', recent) + chips('Ommabop', suggestions);
    results.querySelectorAll('[data-term]').forEach((b) =>
      b.addEventListener('click', () => { document.getElementById('q').value = b.dataset.term; run(b.dataset.term); }));
    return;
  }
  const needle = q.toLowerCase();
  const found = all.filter((p) => [p.name, p.shortDescription, p.skinType, p.ingredients]
    .filter(Boolean).some((f) => f.toLowerCase().includes(needle)));
  saveRecent(q);
  results.innerHTML = found.length
    ? `<div class="section-head"><h2>${found.length} ta natija</h2></div>
       <div class="pcard-grid">${found.map(productCard).join('')}</div>`
    : `<div class="empty-state"><div class="empty-state__emoji">🔍</div><h3>“${esc(q)}” bo'yicha hech narsa topilmadi</h3></div>`;
  bindWishButtons(results, (_, w) => toast(w ? '❤️ Sevimlilarga qo\'shildi' : 'Sevimlilardan olib tashlandi'));
}

function saveRecent(q) {
  const term = q.trim();
  if (!term) return;
  recent = [term, ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 6);
  localStorage.setItem(recentKey, JSON.stringify(recent));
}

(async function init() { all = await dataService.getProducts(); shell(); })();
