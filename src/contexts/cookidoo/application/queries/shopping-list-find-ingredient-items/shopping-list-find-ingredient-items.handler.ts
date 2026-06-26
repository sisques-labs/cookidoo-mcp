import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooIngredientItem } from '@contexts/cookidoo/domain/types/cookidoo-shopping-list.type';
import { ShoppingListFindIngredientItemsQuery } from './shopping-list-find-ingredient-items.query';

@QueryHandler(ShoppingListFindIngredientItemsQuery)
export class ShoppingListFindIngredientItemsQueryHandler implements IQueryHandler<ShoppingListFindIngredientItemsQuery> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(): Promise<CookidooIngredientItem[]> {
    return this.client.getIngredientItems();
  }
}
