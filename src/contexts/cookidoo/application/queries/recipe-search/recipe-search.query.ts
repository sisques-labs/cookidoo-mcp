import { CookidooSearchParams } from '@contexts/cookidoo/domain/types/cookidoo-recipe.type';

/** Query: search the recipe catalogue with optional filters. */
export class RecipeSearchQuery {
  public readonly params: CookidooSearchParams;

  constructor(params: CookidooSearchParams) {
    this.params = params;
  }
}
