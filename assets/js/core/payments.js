/**
 * Faberlic — To'lov adapteri
 * ==========================
 * Barcha to'lov usullari `config.payments.methods` dan olinadi. Hozircha hammasi `manual`:
 * buyurtma "to'lov kutilmoqda" holatida yaratiladi, operator mijoz bilan bog'lanib
 * naqd / Click / Payme / karta orqali to'lovni qabul qiladi.
 *
 * Kelajakda Click yoki Payme API ulamoqchi bo'lsangiz, `pay()` ichiga yangi provider qo'shing.
 *
 * pay() natijasi:
 *   { status: 'pending', provider }      → buyurtma qabul qilindi, to'lov keyin
 *   { status: 'paid',    provider, … }   → to'lov darhol amalga oshdi
 *   { status: 'failed',  provider, error }
 */
import { config } from '../config.js';

const pay_ = () => config.payments;

/** Mijoz tanlashi mumkin bo'lgan usullar. */
export function enabledMethods() {
  return (pay_().methods || []).filter((m) => m.enabled);
}

export function methodById(id) {
  return (pay_().methods || []).find((m) => m.id === id) || null;
}

export async function pay({ method }) {
  const m = typeof method === 'string' ? methodById(method) : method;
  if (!m) throw new Error("Noma'lum to'lov usuli");
  switch (m.provider) {
    case 'manual': return { status: 'pending', provider: 'manual', reference: null };
    default:       return { status: 'failed', provider: m.provider, error: 'Provider sozlanmagan' };
  }
}

export default { enabledMethods, methodById, pay };
