import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooShoppingRecipe } from '@contexts/cookidoo/domain/types/cookidoo-recipe.type';
import { ShoppingListFindRecipesQuery } from './shopping-list-find-recipes.query';

@QueryHandler(ShoppingListFindRecipesQuery)
export class ShoppingListFindRecipesQueryHandler implements IQueryHandler<ShoppingListFindRecipesQuery> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(): Promise<CookidooShoppingRecipe[]> {
    return this.client.getShoppingListRecipes();
  }
}
