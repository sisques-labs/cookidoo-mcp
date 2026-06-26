/** Command: add free-text items to the shopping list (created as not-owned). */
export class ShoppingListAddAdditionalItemsCommand {
  public readonly names: string[];

  constructor(input: { names: string[] }) {
    this.names = input.names;
  }
}
