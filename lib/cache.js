const MAX_CACHE_ENTRIES = 500;
const store = new Map();

function purgeExpired() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
}

function trimIfNeeded() {
  if (store.size <= MAX_CACHE_ENTRIES) {
    return;
  }

  const keys = store.keys();
  while (store.size > MAX_CACHE_ENTRIES) {
    const next = keys.next();
    if (next.done) {
      break;
    }
    store.delete(next.value);
  }
}

export function getCache(key) {
  const entry = store.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }

  return entry.value;
}

export function setCache(key, value, ttlMs) {
  purgeExpired();
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
  trimIfNeeded();
}

export function invalidateCacheByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

export async function getOrSetCache(key, ttlMs, loader) {
  const cached = getCache(key);
  if (cached !== null) {
    return cached;
  }

  const value = await loader();
  setCache(key, value, ttlMs);
  return value;
}
