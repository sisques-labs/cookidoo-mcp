import { CookidooOwnershipChange } from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';

/** Command: set the owned ("bought") flag of free-text additional items. */
export class ShoppingListMarkAdditionalItemsCommand {
  public readonly changes: CookidooOwnershipChange[];

  constructor(input: { changes: CookidooOwnershipChange[] }) {
    this.changes = input.changes;
  }
}
