const STORAGE_VERSION = '1.0.0';

function getKey(key: string): string {
  return `tj_${key}`;
}

export function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getKey(key));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value));
  } catch (e) {
    console.error('localStorage write failed:', e);
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getKey(key));
}

export function initStorage(): void {
  const version = getItem<string>('version');
  if (!version) {
    setItem('version', STORAGE_VERSION);
  }
}
