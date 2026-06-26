/** Command: add recipes to a custom collection. */
export class CustomCollectionAddRecipesCommand {
  public readonly collectionId: string;
  public readonly recipeIds: string[];

  constructor(input: { collectionId: string; recipeIds: string[] }) {
    this.collectionId = input.collectionId;
    this.recipeIds = input.recipeIds;
  }
}
