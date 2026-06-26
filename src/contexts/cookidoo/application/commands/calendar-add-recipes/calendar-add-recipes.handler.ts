import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCalendarDay } from '@contexts/cookidoo/domain/types/cookidoo-calendar.type';
import { CalendarAddRecipesCommand } from './calendar-add-recipes.command';

@CommandHandler(CalendarAddRecipesCommand)
export class CalendarAddRecipesCommandHandler implements ICommandHandler<CalendarAddRecipesCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: CalendarAddRecipesCommand,
  ): Promise<CookidooCalendarDay> {
    return this.client.addRecipesToCalendar(command.day, command.recipeIds);
  }
}
