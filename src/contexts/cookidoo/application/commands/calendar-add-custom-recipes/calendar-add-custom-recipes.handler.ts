import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCalendarDay } from '@contexts/cookidoo/domain/types/cookidoo-calendar.type';
import { CalendarAddCustomRecipesCommand } from './calendar-add-custom-recipes.command';

@CommandHandler(CalendarAddCustomRecipesCommand)
export class CalendarAddCustomRecipesCommandHandler implements ICommandHandler<CalendarAddCustomRecipesCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: CalendarAddCustomRecipesCommand,
  ): Promise<CookidooCalendarDay> {
    return this.client.addCustomRecipesToCalendar(
      command.day,
      command.recipeIds,
    );
  }
}
