import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { ShoppingListRemoveRecipeIngredientsCommand } from './shopping-list-remove-recipe-ingredients.command';

@CommandHandler(ShoppingListRemoveRecipeIngredientsCommand)
export class ShoppingListRemoveRecipeIngredientsCommandHandler
  implements ICommandHandler<ShoppingListRemoveRecipeIngredientsCommand>
{
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: ShoppingListRemoveRecipeIngredientsCommand,
  ): Promise<void> {
    await this.client.removeIngredientItemsForRecipes(command.recipeIds);
  }
}
