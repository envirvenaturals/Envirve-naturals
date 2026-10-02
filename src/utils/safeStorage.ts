// Safe storage utility that gracefully handles QuotaExceededError and prevents runtime crashes

export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    // If quota is exceeded, attempt to clean up any old large non-essential cached media
    if (
      err &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22)
    ) {
      console.warn(`[SafeStorage] localStorage quota reached for "${key}". Attempting cleanup.`);
      try {
        // Remove non-critical old keys or large temporary drafts
        localStorage.removeItem('envirve_temp_upload');
        localStorage.removeItem('envirve_last_upload');
        // Try setting again
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.warn(`[SafeStorage] Could not persist key "${key}" to localStorage. Operating in-memory and syncing with Firestore.`);
        return false;
      }
    }
    console.warn(`[SafeStorage] Storage error for "${key}":`, err);
    return false;
  }
}

export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[SafeStorage] Error reading or parsing key "${key}":`, err);
    return fallback;
  }
}
