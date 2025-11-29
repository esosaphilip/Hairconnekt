// Lightweight fallback for class name concatenation without external deps
export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, boolean>
  | ClassValue[];

function toArray(input: ClassValue): string[] {
  if (Array.isArray(input)) return input.flatMap(toArray);
  if (typeof input === 'string' || typeof input === 'number') return [String(input)];
  if (!input) return [];
  if (typeof input === 'object') {
    return Object.entries(input)
      .filter(([, v]) => Boolean(v))
      .map(([k]) => k);
  }
  return [];
}

export function cn(...inputs: ClassValue[]): string {
  return inputs.flatMap(toArray).join(' ').trim();
}
