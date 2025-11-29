import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async check() {
    try {
      // Database check
      await this.dataSource.query('SELECT 1');

      // Redis check (optional)
      const redisEnv = process.env.REDIS_URL || '';
      let redisStatus: 'up' | 'down' | 'not_configured' | 'invalid_url' = 'not_configured';
      let redisMessage: string | undefined;

      if (redisEnv) {
        if (redisEnv.startsWith('http')) {
          redisStatus = 'invalid_url';
          redisMessage = 'REDIS_URL appears to be an HTTP Upstash REST URL. Use rediss://… for ioredis.';
        } else {
          try {
            const pong = await this.redisService.ping();
            redisStatus = pong ? 'up' : 'down';
            if (!pong) redisMessage = 'Redis ping failed';
          } catch (e: any) {
            redisStatus = 'down';
            redisMessage = e?.message || 'Redis error';
          }
        }
      }

      const response: Record<string, any> = { status: 'ok', db: 'up' };
      response.redis = redisStatus;
      if (redisMessage) response.redisMessage = redisMessage;
      return response;
    } catch (error: any) {
      throw new HttpException(
        { status: 'error', db: 'down', message: error?.message || 'DB error' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}