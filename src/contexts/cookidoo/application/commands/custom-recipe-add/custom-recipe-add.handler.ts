import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCustomRecipe } from '@contexts/cookidoo/domain/types/cookidoo-custom-recipe.type';
import { CustomRecipeAddCommand } from './custom-recipe-add.command';

@CommandHandler(CustomRecipeAddCommand)
export class CustomRecipeAddCommandHandler implements ICommandHandler<CustomRecipeAddCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: CustomRecipeAddCommand,
  ): Promise<CookidooCustomRecipe> {
    return this.client.addCustomRecipeFrom(
      command.recipeId,
      command.servingSize,
    );
  }
}
