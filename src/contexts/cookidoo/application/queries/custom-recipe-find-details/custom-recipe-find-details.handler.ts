import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCustomRecipe } from '@contexts/cookidoo/domain/types/cookidoo-custom-recipe.type';
import { CustomRecipeFindDetailsQuery } from './custom-recipe-find-details.query';

@QueryHandler(CustomRecipeFindDetailsQuery)
export class CustomRecipeFindDetailsQueryHandler implements IQueryHandler<CustomRecipeFindDetailsQuery> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    query: CustomRecipeFindDetailsQuery,
  ): Promise<CookidooCustomRecipe> {
    return this.client.getCustomRecipe(query.id);
  }
}
