import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCalendarDay } from '@contexts/cookidoo/domain/types/cookidoo-calendar.type';
import { CalendarRemoveCustomRecipeCommand } from './calendar-remove-custom-recipe.command';

@CommandHandler(CalendarRemoveCustomRecipeCommand)
export class CalendarRemoveCustomRecipeCommandHandler implements ICommandHandler<CalendarRemoveCustomRecipeCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: CalendarRemoveCustomRecipeCommand,
  ): Promise<CookidooCalendarDay> {
    return this.client.removeCustomRecipeFromCalendar(
      command.day,
      command.recipeId,
    );
  }
}
