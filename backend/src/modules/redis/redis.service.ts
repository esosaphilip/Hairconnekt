import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;
  private initError: string | null = null;
  private url: string = '';

  constructor() {
    const url = process.env.REDIS_URL || '';
    this.url = url;
    if (!url) {
      this.initError = 'REDIS_URL not set';
      return;
    }

    if (url.startsWith('http')) {
      // Upstash REST URL provided — HTTP is not supported by ioredis
      this.initError = 'REDIS_URL appears to be an HTTP Upstash REST URL. Use rediss://… to enable TCP/TLS connections.';
      return;
    }

    // Lazy init; do not connect during module construction
  }

  getClient(): Redis | null {
    if (this.client) return this.client;
    if (this.initError) return null;
    if (!this.url) return null;
    try {
      const useTls = this.url.startsWith('rediss://');
      const options = useTls ? { tls: {} } : {};
      this.client = new Redis(this.url, options);
      this.client.on('error', (err) => {
        console.error('[Redis] error event:', (err as any)?.message || err);
      });
      return this.client;
    } catch (e) {
      const msg = (e as Error)?.message || 'Failed to initialize Redis client';
      this.initError = msg;
      return null;
    }
  }

  async ping(): Promise<boolean> {
    if (this.initError) {
      throw new Error(this.initError);
    }
    const client = this.getClient();
    if (!client) {
      throw new Error('Redis client not initialized');
    }
    const res = await client.ping();
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
