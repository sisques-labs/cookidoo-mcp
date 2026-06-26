/** Command: remove a single recipe from a custom collection. */
export class CustomCollectionRemoveRecipeCommand {
  public readonly collectionId: string;
  public readonly recipeId: string;

  constructor(input: { collectionId: string; recipeId: string }) {
    this.collectionId = input.collectionId;
    this.recipeId = input.recipeId;
  }
}
