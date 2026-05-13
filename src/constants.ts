export const APP_LOGO_URL = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234ade80' /%3E%3Cstop offset='100%25' style='stop-color:%23166534' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='48' fill='none' stroke='%23166534' stroke-width='8'/%3E%3Cg transform='translate(5, 5) scale(0.9)'%3E%3Cpath d='M25 60 L50 72 L75 60 L75 65 L50 77 L25 65 Z' fill='%23064e3b' /%3E%3Cpath d='M25 55 L50 67 L75 55 L75 60 L50 72 L25 60 Z' fill='%2314532d' /%3E%3Cpath d='M25 50 L50 62 L75 50 L75 55 L50 67 L25 55 Z' fill='%23166534' /%3E%3Cpath d='M25 45 L50 57 L75 45 L50 33 Z' fill='%2322c55e' /%3E%3Cpath d='M75 45 L75 50 L50 62 L50 57 Z' fill='%2315803d' /%3E%3Cpath d='M25 45 L25 50 L50 62 L50 57 Z' fill='%2314532d' /%3E%3Ctext x='50' y='50' font-family='sans-serif' font-size='14' font-weight='900' fill='%23064e3b' text-anchor='middle' transform='skewY(14)'%3E$%3C/text%3E%3C/g%3E%3C/svg%3E`;

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'UGX', symbol: 'Ush', name: 'Ugandan Shilling' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

export const TRANSACTION_CATEGORIES = [
  'Utilities',
  'Shopping',
  'Food & Drinks',
  'Transport',
  'Transfer',
  'Entertainment',
  'Health',
  'Education',
  'Salary',
  'Other',
];

export const BILLERS = [
  { id: '1', name: 'Umeme', category: 'Utilities', logo: 'zap' },
  { id: '2', name: 'NWSC', category: 'Utilities', logo: 'droplet' },
  { id: '3', name: 'Zuku', category: 'Internet', logo: 'wifi' },
  { id: '4', name: 'MultiChoice', category: 'Entertainment', logo: 'tv' },
];
