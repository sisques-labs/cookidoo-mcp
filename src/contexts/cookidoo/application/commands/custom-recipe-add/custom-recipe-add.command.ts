/** Command: create a custom recipe derived from an existing recipe. */
export class CustomRecipeAddCommand {
  public readonly recipeId: string;
  public readonly servingSize: number;

  constructor(input: { recipeId: string; servingSize: number }) {
    this.recipeId = input.recipeId;
    this.servingSize = input.servingSize;
  }
}
