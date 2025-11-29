import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;
  private initError: string | null = null;

  constructor() {
    const url = process.env.REDIS_URL || '';
    if (!url) {
      this.initError = 'REDIS_URL not set';
      return;
    }

    if (url.startsWith('http')) {
      // Upstash REST URL provided — HTTP is not supported by ioredis
      this.initError = 'REDIS_URL appears to be an HTTP Upstash REST URL. Use rediss://… to enable TCP/TLS connections.';
      return;
    }

    try {
      const useTls = url.startsWith('rediss://');
      const options = useTls ? { tls: {} } : {};
      this.client = new Redis(url, options);
      // Prevent unhandled 'error' events from crashing the process
      this.client.on('error', (err) => {
        // eslint-disable-next-line no-console
        console.error('[Redis] error event:', (err as any)?.message || err);
      });
    } catch (e) {
      const msg = (e as Error)?.message || 'Failed to initialize Redis client';
      this.initError = msg;
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  async ping(): Promise<boolean> {
    if (this.initError) {
      throw new Error(this.initError);
    }
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }
    const res = await this.client.ping();
    return res === 'PONG';
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        this.client.disconnect();
      } catch (_) {
        // ignore
      }
      this.client = null;
    }
  }
}