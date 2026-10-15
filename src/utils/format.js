const nairaFormatter = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 });

export const formatNaira = (amount) =>
  amount == null || Number.isNaN(Number(amount)) ? '' : `₦${nairaFormatter.format(Number(amount))}`;

export function formatPrice(artisan) {
  if (!artisan) return '';
  if (artisan.pricingType === 'quote' || artisan.startingPrice == null) return 'Request a quote';
  const amount = formatNaira(artisan.startingPrice);
  if (artisan.pricingType === 'hourly') return `${amount}/hr`;
  return `From ${amount}`;
}

export const PRICING_LABELS = {
  fixed: 'Fixed price',
  hourly: 'Hourly rate',
  quote: 'Quote-based',
};

export const CONTACT_LABELS = {
  phone: 'Phone call',
  whatsapp: 'WhatsApp',
  'in-app': 'In-app message',
};

export function formatDate(value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  const d = typeof value === 'string' && value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-NG', opts);
}

export function formatTime(value) {
  const d = new Date(value);
  return d.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' });
}

export function formatRelative(value) {
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const min = 60 * 1000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff < min) return 'Just now';
  if (diff < hour) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return formatDate(value, { day: 'numeric', month: 'short' });
}

export function formatChatDay(value) {
  const d = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return formatDate(value, { weekday: 'short', day: 'numeric', month: 'short' });
}

export const pluralize = (n, word, plural = `${word}s`) => `${n} ${n === 1 ? word : plural}`;

export const initials = (name = '') =>
  name
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const cn = (...classes) => classes.filter(Boolean).join(' ');
