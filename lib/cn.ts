type ClassValue = string | undefined | null | false;

export function cn(...values: ClassValue[]) {
  return values.filter(Boolean).join(" ");
}

