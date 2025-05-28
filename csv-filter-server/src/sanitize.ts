export function sanitize(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s\-_.\/]/gu, '').trim();
}
