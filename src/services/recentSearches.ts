import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@hc_recent_searches';
const MAX_ITEMS = 8;

export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Ensure only strings and trim empties
      return parsed
        .filter((x) => typeof x === 'string')
        .map((x) => x.trim())
        .filter((x) => x.length > 0)
        .slice(0, MAX_ITEMS);
    }
    return [];
  } catch {
    return [];
  }
}

export async function addRecentSearch(term: string): Promise<string[]> {
  const clean = term?.trim();
  if (!clean) return getRecentSearches();
  try {
    const current = await getRecentSearches();
    const withoutDup = current.filter((t) => t.toLowerCase() !== clean.toLowerCase());
    const next = [clean, ...withoutDup].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    // On failure, return current state
    return getRecentSearches();
  }
}

export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}