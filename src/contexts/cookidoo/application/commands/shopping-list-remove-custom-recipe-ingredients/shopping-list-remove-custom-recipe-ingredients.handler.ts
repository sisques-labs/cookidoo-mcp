import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { ShoppingListRemoveCustomRecipeIngredientsCommand } from './shopping-list-remove-custom-recipe-ingredients.command';

@CommandHandler(ShoppingListRemoveCustomRecipeIngredientsCommand)
export class ShoppingListRemoveCustomRecipeIngredientsCommandHandler implements ICommandHandler<ShoppingListRemoveCustomRecipeIngredientsCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: ShoppingListRemoveCustomRecipeIngredientsCommand,
  ): Promise<void> {
    await this.client.removeIngredientItemsForCustomRecipes(command.recipeIds);
  }
}
