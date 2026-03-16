/**
 * WhatsApp link security and formatting helpers
 */

/**
 * Sanitizes a phone number to only contain digits.
 * @param raw The raw phone number string
 * @returns A string of digits
 */
export function sanitizePhoneE164ish(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/\D+/g, '');
}

/**
 * Sanitizes a prefill message and optionally appends a region.
 * Caps to 500 characters to avoid absurd URLs.
 * @param raw The raw prefill message
 * @param region Optional region label to append
 * @returns A sanitized and capped string
 */
export function sanitizePrefill(raw?: string, region?: string): string {
  const base = (raw && typeof raw === 'string' ? raw : '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim();
  const withRegion = region ? (base.length ? base + '\n(Area: ' + region + ')' : '(Area: ' + region + ')') : base;
  return withRegion.slice(0, 500);
}

/**
 * Builds a safe WhatsApp (wa.me) URL.
 * @param phoneRaw The raw phone number
 * @param textRaw The raw prefill text
 * @returns A safe wa.me URL string, or null if the phone is invalid
 */
export function buildSafeWaHref(phoneRaw?: string, textRaw?: string): string | null {
  const phone = sanitizePhoneE164ish(phoneRaw);
  const text = sanitizePrefill(textRaw);
  if (!phone) return null;

  const url = 'https://wa.me/' + phone + (text ? ('?text=' + encodeURIComponent(text)) : '');
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' || u.hostname !== 'wa.me') return null;
    return u.toString();
  } catch {
    return null;
  }
}
