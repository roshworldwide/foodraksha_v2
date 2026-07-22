type ClassValue = string | false | null | undefined;

/** Join class names, dropping falsy values. No dependency needed. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
