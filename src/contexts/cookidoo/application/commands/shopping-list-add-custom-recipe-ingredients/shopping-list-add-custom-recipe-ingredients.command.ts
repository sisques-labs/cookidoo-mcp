/** Command: add the ingredients of the given custom recipes to the list. */
export class ShoppingListAddCustomRecipeIngredientsCommand {
  public readonly recipeIds: string[];

  constructor(input: { recipeIds: string[] }) {
    this.recipeIds = input.recipeIds;
  }
}
