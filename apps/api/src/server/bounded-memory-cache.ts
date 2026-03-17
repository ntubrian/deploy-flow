interface CacheEntry<TValue> {
  expiresAt: number | null;
  value: TValue;
}

export interface KeyValueCacheSetOptions {
  ttl?: number;
}

export interface KeyValueCache<TValue> {
  delete(key: string): Promise<boolean | void>;
  get(key: string): Promise<TValue | undefined>;
  set(
    key: string,
    value: TValue,
    options?: KeyValueCacheSetOptions
  ): Promise<void>;
}

export class BoundedMemoryCache<TValue> implements KeyValueCache<TValue> {
  private readonly cache = new Map<string, CacheEntry<TValue>>();

  constructor(private readonly maxEntries = 1024) {}

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async get(key: string): Promise<TValue | undefined> {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.cache.delete(key);

      return undefined;
    }

    // Refresh recency so the oldest entry is evicted first.
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  async set(
    key: string,
    value: TValue,
    options?: KeyValueCacheSetOptions
  ): Promise<void> {
    const ttlMilliseconds = options?.ttl ? options.ttl * 1000 : null;
    const entry: CacheEntry<TValue> = {
      expiresAt: ttlMilliseconds === null ? null : Date.now() + ttlMilliseconds,
      value,
    };

    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    this.cache.set(key, entry);

    while (this.cache.size > this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;

      if (!oldestKey) {
        break;
      }

      this.cache.delete(oldestKey);
    }
  }
}
