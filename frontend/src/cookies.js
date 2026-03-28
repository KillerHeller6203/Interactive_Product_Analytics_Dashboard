/**
 * Cookie utilities for filter state persistence.
 * Stores: start_date, end_date, age_group, gender
 */

const COOKIE_EXPIRY_DAYS = 30;

export function setCookie(name, value, days = COOKIE_EXPIRY_DAYS) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// ── Bulk save/load filters ──────────────────────────
export function saveFilters(filters) {
  if (filters.startDate) setCookie('start_date', filters.startDate);
  if (filters.endDate) setCookie('end_date', filters.endDate);
  setCookie('age_group', filters.ageGroup || 'all');
  setCookie('gender', filters.gender || 'all');
}

export function loadFilters() {
  return {
    startDate: getCookie('start_date') || '',
    endDate: getCookie('end_date') || '',
    ageGroup: getCookie('age_group') || 'all',
    gender: getCookie('gender') || 'all',
  };
}
