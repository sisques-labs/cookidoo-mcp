import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooIngredientItem } from '@contexts/cookidoo/domain/types/cookidoo-shopping-list.type';
import { ShoppingListAddRecipeIngredientsCommand } from './shopping-list-add-recipe-ingredients.command';

@CommandHandler(ShoppingListAddRecipeIngredientsCommand)
export class ShoppingListAddRecipeIngredientsCommandHandler
  implements ICommandHandler<ShoppingListAddRecipeIngredientsCommand>
{
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: ShoppingListAddRecipeIngredientsCommand,
  ): Promise<CookidooIngredientItem[]> {
    return this.client.addIngredientItemsForRecipes(command.recipeIds);
  }
}
