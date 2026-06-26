import { CookidooAdditionalItemEdit } from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';

/** Command: rename free-text ("additional") shopping-list items. */
export class ShoppingListEditAdditionalItemsCommand {
  public readonly edits: CookidooAdditionalItemEdit[];

  constructor(input: { edits: CookidooAdditionalItemEdit[] }) {
    this.edits = input.edits;
  }
}
