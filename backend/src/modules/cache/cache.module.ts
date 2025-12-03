import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { AppCacheService } from './cache.service';
import { AppCacheInterceptor } from './app-cache.interceptor';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const url = process.env.REDIS_URL || '';
        const enable = (process.env.ENABLE_REDIS || '').toLowerCase() === 'true';
        const base = {
          ttl: Number(process.env.CACHE_TTL ?? 60),
          max: Number(process.env.CACHE_MAX ?? 100),
        } as any;
        // Only attempt Redis if explicitly enabled and a URL is provided
        if (enable && url) {
          try {
            const isRediss = url.startsWith('rediss://');
            const store = await redisStore({ url, tls: isRediss ? {} : undefined } as any);
            return { ...base, store: store as any };
          } catch (e) {
            console.warn('Redis Connection Error: ', e);
            return base;
          }
        }
        return base;
      },
    }),
  ],
  providers: [AppCacheService, AppCacheInterceptor],
  exports: [NestCacheModule, AppCacheService, AppCacheInterceptor],
})
export class AppCacheModule {}
