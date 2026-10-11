/**
 * Nova Kit — Formatting helpers
 * All currency rendering goes through `formatPrice()` so it obeys `config.currency`.
 */
import { config } from '../config.js';

export function formatPrice(amount) {
  const { symbol, position, decimals, thousands, decimal } = config.currency;
  const fixed = Number(amount || 0).toFixed(decimals);
  let [int, frac] = fixed.split('.');
  int = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  const num = frac ? `${int}${decimal}${frac}` : int;
  return position === 'after' ? `${num}${symbol}` : `${symbol}${num}`;
}

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

/** 11-oktabr, 2026 */
export function formatDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

/** 11-oktabr, 14:05 */
export function formatDateTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${hh}:${mm}`;
}

export default { formatPrice, formatDate, formatDateTime };
