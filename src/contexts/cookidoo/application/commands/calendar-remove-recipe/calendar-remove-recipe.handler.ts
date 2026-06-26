import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCalendarDay } from '@contexts/cookidoo/domain/types/cookidoo-calendar.type';
import { CalendarRemoveRecipeCommand } from './calendar-remove-recipe.command';

@CommandHandler(CalendarRemoveRecipeCommand)
export class CalendarRemoveRecipeCommandHandler implements ICommandHandler<CalendarRemoveRecipeCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: CalendarRemoveRecipeCommand,
  ): Promise<CookidooCalendarDay> {
    return this.client.removeRecipeFromCalendar(command.day, command.recipeId);
  }
}
