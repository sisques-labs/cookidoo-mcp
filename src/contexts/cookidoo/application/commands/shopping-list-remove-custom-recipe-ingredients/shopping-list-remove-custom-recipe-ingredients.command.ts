/** Command: remove the ingredients of the given custom recipes from the list. */
export class ShoppingListRemoveCustomRecipeIngredientsCommand {
  public readonly recipeIds: string[];

  constructor(input: { recipeIds: string[] }) {
    this.recipeIds = input.recipeIds;
  }
}
