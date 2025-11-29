import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    // TODO: replace with real job logic (cleanup, stats aggregation, etc.)
    this.logger.log('Running scheduled task: EVERY_MINUTE');
  }
}