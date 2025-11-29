import { Injectable, ExecutionContext, SetMetadata, Inject } from '@nestjs/common';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';

export const APP_CACHE_PREFIX = 'APP_CACHE_PREFIX';
export const APP_CACHE_PER_USER = 'APP_CACHE_PER_USER';
export const APP_CACHE_KEY_BUILDER = 'APP_CACHE_KEY_BUILDER';

// Decorator to set a cache key prefix for a route
export const CachePrefix = (prefix: string) => SetMetadata(APP_CACHE_PREFIX, prefix);

// Decorator to include authenticated user id in the cache key
export const CachePerUser = () => SetMetadata(APP_CACHE_PER_USER, true);

// Decorator to provide a dynamic key builder that receives the Express request
export const CacheKeyBuilder = (builder: (req: any) => string) => SetMetadata(APP_CACHE_KEY_BUILDER, builder);

@Injectable()
export class AppCacheInterceptor extends CacheInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    reflector: Reflector,
  ) {
    // Pass required dependencies to base CacheInterceptor
    super(cacheManager, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const handler = context.getHandler();

    // If a custom builder is provided, use it
    const builder = this.reflector.get<(req: any) => string>(APP_CACHE_KEY_BUILDER, handler);
    const req = context.switchToHttp().getRequest();
    if (typeof builder === 'function') {
      try {
        const key = builder(req);
        if (key) return key;
      } catch {}
    }

    // Respect Nest's built-in static CacheKey metadata if present
    // The metadata key used by the CacheKey decorator is 'cache_key' internally.
    const staticKey = this.reflector.get<string>('cache_key', handler);
    if (staticKey) return staticKey;

    // Otherwise, build a deterministic key from prefix + path + params + canonical query + optional user id
    const prefix = this.reflector.get<string>(APP_CACHE_PREFIX, handler) || 'http';
    const perUser = !!this.reflector.get<boolean>(APP_CACHE_PER_USER, handler);

    const path: string = (req?.baseUrl || '') + (req?.path || req?.originalUrl?.split('?')[0] || '');
    const params = req?.params || {};
    const query = req?.query || {};

    const paramPairs = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');
    const queryPairs = Object.keys(query)
      .sort()
      .map((k) => {
        const v = query[k];
        const val = Array.isArray(v) ? v.join(',') : String(v);
        return `${k}=${val}`;
      })
      .join('&');

    let key = `${prefix}:${path}`;
    if (paramPairs) key += `:${paramPairs}`;
    if (queryPairs) key += `?${queryPairs}`;
    if (perUser) {
      const uid = req?.user?.sub || req?.user?.id || '';
      if (uid) key += `:user=${uid}`;
    }
    return key;
  }
}