import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCalendarDay } from '@contexts/cookidoo/domain/types/cookidoo-calendar.type';
import { CalendarFindWeekRecipesQuery } from './calendar-find-week-recipes.query';

@QueryHandler(CalendarFindWeekRecipesQuery)
export class CalendarFindWeekRecipesQueryHandler implements IQueryHandler<CalendarFindWeekRecipesQuery> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    query: CalendarFindWeekRecipesQuery,
  ): Promise<CookidooCalendarDay[]> {
    return this.client.getRecipesInCalendarWeek(query.day);
  }
}
