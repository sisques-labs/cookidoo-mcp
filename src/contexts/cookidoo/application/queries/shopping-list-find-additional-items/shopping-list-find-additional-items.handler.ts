import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooAdditionalItem } from '@contexts/cookidoo/domain/types/cookidoo-shopping-list.type';
import { ShoppingListFindAdditionalItemsQuery } from './shopping-list-find-additional-items.query';

@QueryHandler(ShoppingListFindAdditionalItemsQuery)
export class ShoppingListFindAdditionalItemsQueryHandler
  implements IQueryHandler<ShoppingListFindAdditionalItemsQuery>
{
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(): Promise<CookidooAdditionalItem[]> {
    return this.client.getAdditionalItems();
  }
}
