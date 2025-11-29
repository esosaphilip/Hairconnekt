import { Injectable } from '@nestjs/common';

export interface EventsQuery {
  from?: string;
  to?: string;
}

@Injectable()
export class AnalyticsService {
  async getEvents(query: EventsQuery) {
    // TODO: integrate with analytics store (DB or external provider)
    return {
      info: 'Analytics events placeholder',
      query,
      items: [],
    };
  }
}