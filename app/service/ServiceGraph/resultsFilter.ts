import { serviceNode } from './serviceNode';

// ...existing code...
export function filter(data: Map<string, serviceNode>, query?: string): serviceNode[] {
  if (!query) return Array.from(data.values());

  const [rawKey, rawNeedle] = query.split('=');
  const key = rawKey?.trim();
  const needle = rawNeedle?.trim().toLowerCase();

  if (!key || !needle) return Array.from(data.values());

  return Array.from(data.values()).filter(node => {
    const value = (node as Record<string, unknown>)[key];
    return matchesLike(value, needle);
  });
}

function matchesLike(value: unknown, needle: string): boolean {
  if (value == null) return false;

  if (typeof value === 'string') {
    return value.toLowerCase().includes(needle);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).toLowerCase().includes(needle);
  }

  if (Array.isArray(value)) {
    const [key, vulnerabilitiesNeedle] = needle.split('>');
    return value.some(v => matchesLike((v as Record<string, unknown>)[key], vulnerabilitiesNeedle?.trim() || needle));
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).some(v => matchesLike(v, needle));
  }

  return false;
}