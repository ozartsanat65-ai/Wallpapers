const STORAGE_KEY = 'terraview_favorites';

export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(id: string): string[] {
  const current = getFavorites();
  const updated = current.includes(id)
    ? current.filter((f) => f !== id)
    : [...current, id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}
