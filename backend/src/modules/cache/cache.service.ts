import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AppCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return (await this.cache.get<T>(key)) ?? undefined;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.cache.set(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  async wrap<T>(key: string, fn: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const hit = await this.get<T>(key);
    if (hit !== undefined) return hit;
    const value = await fn();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Delete all cache entries whose keys start with the given prefix.
   * Note: When using a Redis store, this may rely on the store's `keys` implementation
   * which can be expensive. Use sparingly and with reasonably specific prefixes.
   * Returns the number of deleted keys.
   */
  async deleteByPrefix(prefix: string): Promise<number> {
    const store: any = (this.cache as any)?.store;
    const hasKeys = store && typeof store.keys === 'function';
    let keys: string[] = [];
    try {
      keys = hasKeys ? await store.keys(`${prefix}*`) : [];
    } catch {
      keys = [];
    }
    let deleted = 0;
    for (const k of keys) {
      try {
        await this.del(k);
        deleted++;
      } catch {}
    }
    return deleted;
  }

  /** Delete multiple specific cache keys */
  async deleteMany(keys: string[]): Promise<number> {
    let deleted = 0;
    for (const k of keys) {
      try {
        await this.del(k);
        deleted++;
      } catch {}
    }
    return deleted;
  }
}