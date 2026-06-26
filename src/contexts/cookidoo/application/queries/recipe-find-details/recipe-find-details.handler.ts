import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooRecipeDetails } from '@contexts/cookidoo/domain/types/cookidoo-recipe.type';
import { RecipeFindDetailsQuery } from './recipe-find-details.query';

@QueryHandler(RecipeFindDetailsQuery)
export class RecipeFindDetailsQueryHandler implements IQueryHandler<RecipeFindDetailsQuery> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(query: RecipeFindDetailsQuery): Promise<CookidooRecipeDetails> {
    return this.client.getRecipeDetails(query.id);
  }
}
