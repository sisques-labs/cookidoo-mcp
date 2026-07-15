/** Command: remove free-text items from the shopping list by id. */
export class ShoppingListRemoveAdditionalItemsCommand {
  public readonly ids: string[];

  constructor(input: { ids: string[] }) {
    this.ids = input.ids;
  }
}
