/** Command: add the ingredients of the given recipes to the shopping list. */
export class ShoppingListAddRecipeIngredientsCommand {
  public readonly recipeIds: string[];

  constructor(input: { recipeIds: string[] }) {
    this.recipeIds = input.recipeIds;
  }
}
