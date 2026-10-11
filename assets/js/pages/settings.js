/**
 * Faberlic — Sozlamalar
 * Ko'rinish (yorug'/qorong'i/avto), valyuta va bildirishnomalar. Darhol qo'llanadi.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { t } from '../i18n/index.js';
import { icon } from '../core/icons.js';
import { applyTheme, setColorScheme, savedColorScheme } from '../core/theme.js';
import { esc, toast } from '../core/ui.js';
import { haptic } from '../core/telegram.js';
import { appBar, tabBar } from '../components.js';

bootstrap();

const NS = config.data.persistNamespace;
const screen = document.getElementById('screen');
const prefsKey = `${NS}:prefs`;
const prefs = JSON.parse(localStorage.getItem(prefsKey) || '{}');

function render() {
  document.getElementById('appbar').innerHTML = appBar({ title: t('profile.settings'), back: 'profile.html' });

  const scheme = savedColorScheme();
  const themeControl = config.theme.allowUserToggle ? `
    <div class="settings-group">
      <div class="settings-group__label">Ko'rinish</div>
      <div class="card card--pad">
        <div class="segmented" id="themeSeg">
          <button data-scheme="light" class="${scheme === 'light' ? 'is-active' : ''}">☀️ Yorug'</button>
          <button data-scheme="dark" class="${scheme === 'dark' ? 'is-active' : ''}">🌙 Qorong'i</button>
          <button data-scheme="auto" class="${scheme === 'auto' ? 'is-active' : ''}">Avto</button>
        </div>
      </div>
    </div>` : '';

  const CURRENCY_NAMES = { UZS: "O'zbek so'mi", USD: 'AQSh dollari' };
  const currencyName = CURRENCY_NAMES[config.currency.code] || config.currency.code;
  const currencyRow = `
    <div class="settings-group">
      <div class="settings-group__label">Valyuta</div>
      <div class="list"><div class="list-row">
        <span class="list-row__icon">${icon('tag', { size: 20 })}</span>
        <span class="list-row__text"><span class="list-row__title">${currencyName}</span>
          <span class="list-row__sub">${config.currency.code} · ${config.currency.symbol.trim()}</span></span>
      </div></div>
    </div>`;

  const notifRow = config.features.notifications ? toggleRow(
    'notifications', '🔔 Buyurtma xabarlari', prefs.notifications !== false) : '';
  const emailRow = toggleRow('marketing', '📣 Aksiya va chegirmalar', Boolean(prefs.marketing));

  screen.innerHTML = `
    ${themeControl}
    ${currencyRow}
    <div class="settings-group">
      <div class="settings-group__label">Bildirishnomalar</div>
      <div class="list">${notifRow}${emailRow}</div>
    </div>`;

  document.getElementById('tabbar').innerHTML = tabBar('profile');
  wire();
}

function toggleRow(key, label, checked) {
  return `<div class="list-row">
    <span class="list-row__text"><span class="list-row__title">${label}</span></span>
    <label class="switch"><input type="checkbox" data-pref="${key}" ${checked ? 'checked' : ''}>
      <span class="switch__track"></span></label>
  </div>`;
}

function wire() {
  screen.querySelectorAll('[data-scheme]').forEach((b) => b.addEventListener('click', () => {
    setColorScheme(b.dataset.scheme);
    applyTheme();
    haptic('selection');
    render();
  }));
  screen.querySelectorAll('[data-pref]').forEach((c) => c.addEventListener('change', () => {
    prefs[c.dataset.pref] = c.checked;
    localStorage.setItem(prefsKey, JSON.stringify(prefs));
  }));
}

render();
