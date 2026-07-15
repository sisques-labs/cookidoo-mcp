import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooIngredientItem } from '@contexts/cookidoo/domain/types/cookidoo-shopping-list.type';
import { ShoppingListAddCustomRecipeIngredientsCommand } from './shopping-list-add-custom-recipe-ingredients.command';

@CommandHandler(ShoppingListAddCustomRecipeIngredientsCommand)
export class ShoppingListAddCustomRecipeIngredientsCommandHandler implements ICommandHandler<ShoppingListAddCustomRecipeIngredientsCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: ShoppingListAddCustomRecipeIngredientsCommand,
  ): Promise<CookidooIngredientItem[]> {
    return this.client.addIngredientItemsForCustomRecipes(command.recipeIds);
  }
}
