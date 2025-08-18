import type { StatePersistor, StateKey } from 'swr-global-state';

const LocalStoragePersistor: StatePersistor = {
  onSet<T>(key: StateKey, data: T) {
    const stringifyData = JSON.stringify(data);
    window.localStorage.setItem(String(key), stringifyData);
  },
  onGet(key: StateKey) {
    const cachedData = window.localStorage.getItem(String(key)) ?? 'null';
    try {
      return JSON.parse(cachedData);
    } catch {
      return cachedData;
    }
  }
};

/**
 * Parse a value persisted by LocalStoragePersistor.onSet (JSON.stringify-ed).
 * Returns parsed value if JSON, otherwise returns the raw string.
 *
 * @template T The expected type of the parsed value
 * @param raw The raw string value from localStorage (or null)
 * @returns The parsed value or null when not present
 */
export function parsePersistedValue<T = unknown>(raw: string | null): T | null {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T | null;
  } catch {
    return raw as unknown as T;
  }
}

export default LocalStoragePersistor;
