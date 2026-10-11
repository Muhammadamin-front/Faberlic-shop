/**
 * Faberlic — Tanishuv
 * Birinchi ochilishda ko'rsatiladigan qisqa tanishtiruv slaydlari.
 */
import { config } from '../config.js';
import { bootstrap } from '../app.js';
import { esc } from '../core/ui.js';
import { haptic } from '../core/telegram.js';

bootstrap();

const screen = document.getElementById('screen');
const key = `${config.data.persistNamespace}:onboarded`;

const slides = [
  { emoji: '🌸', title: `${config.brand.name} ga xush kelibsiz`, text: config.brand.tagline },
  { emoji: '🛍️', title: 'Bir bosishda xarid', text: "Telegramdan chiqmasdan mahsulotlarni ko'ring, savatga qo'shing va buyurtma bering." },
  { emoji: '🚚', title: 'Tez yetkazib berish', text: "Naqd, Click yoki Payme orqali to'lang — eshigingizgacha yetkazamiz." },
];

let index = 0;

function render() {
  screen.innerHTML = `
    <div class="onb">
      <div class="onb__track" id="track">
        ${slides.map((s) => `<div class="onb__slide">
          <div class="onb__emoji">${s.emoji}</div>
          <h2>${esc(s.title)}</h2><p>${esc(s.text)}</p></div>`).join('')}
      </div>
      <div class="onb__foot">
        <div class="onb__dots">${slides.map((_, i) => `<span class="onb__dot${i === 0 ? ' is-on' : ''}"></span>`).join('')}</div>
        <button class="btn btn--block" id="next">Keyingi</button>
        <button class="btn btn--outline btn--block" id="skip">O'tkazib yuborish</button>
      </div>
    </div>`;

  const track = document.getElementById('track');
  const dots = screen.querySelectorAll('.onb__dot');
  const nextBtn = document.getElementById('next');

  track.addEventListener('scroll', () => {
    index = Math.round(track.scrollLeft / track.clientWidth);
    dots.forEach((d, i) => d.classList.toggle('is-on', i === index));
    nextBtn.textContent = index === slides.length - 1 ? 'Boshlash' : 'Keyingi';
  });

  nextBtn.addEventListener('click', () => {
    if (index < slides.length - 1) { index++; track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' }); haptic('selection'); }
    else finish();
  });
  document.getElementById('skip').addEventListener('click', finish);
}

function finish() {
  localStorage.setItem(key, '1');
  location.href = 'index.html';
}

render();
