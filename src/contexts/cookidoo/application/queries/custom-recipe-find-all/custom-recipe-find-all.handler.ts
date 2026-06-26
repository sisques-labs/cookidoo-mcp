import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCustomRecipe } from '@contexts/cookidoo/domain/types/cookidoo-custom-recipe.type';
import { CustomRecipeFindAllQuery } from './custom-recipe-find-all.query';

@QueryHandler(CustomRecipeFindAllQuery)
export class CustomRecipeFindAllQueryHandler implements IQueryHandler<CustomRecipeFindAllQuery> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(): Promise<CookidooCustomRecipe[]> {
    return this.client.listCustomRecipes();
  }
}
