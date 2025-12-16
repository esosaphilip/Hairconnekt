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
        const isRediss = url.startsWith('rediss://');
        const store = await redisStore({
          url,
          // Enable TLS for Upstash when using rediss://
          tls: isRediss ? {} : undefined,
        } as any);
        return {
          store: store as any,
          // Default TTL in seconds for cached responses
          ttl: Number(process.env.CACHE_TTL ?? 60),
          // Max entries (primarily effective for in-memory store; harmless here)
          max: Number(process.env.CACHE_MAX ?? 100),
        };
      },
    }),
  ],
  providers: [AppCacheService, AppCacheInterceptor],
  exports: [NestCacheModule, AppCacheService, AppCacheInterceptor],
})
export class AppCacheModule {}