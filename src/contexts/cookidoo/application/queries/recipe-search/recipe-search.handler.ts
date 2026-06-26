import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooSearchResult } from '@contexts/cookidoo/domain/types/cookidoo-recipe.type';
import { RecipeSearchQuery } from './recipe-search.query';

@QueryHandler(RecipeSearchQuery)
export class RecipeSearchQueryHandler implements IQueryHandler<RecipeSearchQuery> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(query: RecipeSearchQuery): Promise<CookidooSearchResult> {
    return this.client.searchRecipes(query.params);
  }
}
