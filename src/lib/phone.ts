/**
 * Phone helpers — always derive tel: links from site registry values.
 */

export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** E.164-ish tel href for US numbers stored as display strings. */
export function phoneTelHref(phone: string): string {
  const digits = phoneDigits(phone);
  if (digits.length === 11 && digits.startsWith("1")) {
    return `tel:+${digits}`;
  }
  if (digits.length === 10) {
    return `tel:+1${digits}`;
  }
  return `tel:${digits}`;
}
