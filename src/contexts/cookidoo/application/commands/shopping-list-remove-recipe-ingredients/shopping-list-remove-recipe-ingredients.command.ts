/** Command: remove the ingredients of the given recipes from the shopping list. */
export class ShoppingListRemoveRecipeIngredientsCommand {
  public readonly recipeIds: string[];

  constructor(input: { recipeIds: string[] }) {
    this.recipeIds = input.recipeIds;
  }
}
