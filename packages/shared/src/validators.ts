export function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function isPhone(s: string): boolean {
  // very lenient: 7-15 digits ignoring spaces and punctuation
  const digits = s.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}