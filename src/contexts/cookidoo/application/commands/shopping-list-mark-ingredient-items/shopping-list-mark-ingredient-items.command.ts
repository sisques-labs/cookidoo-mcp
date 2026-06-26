import { CookidooOwnershipChange } from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';

/** Command: set the owned ("bought") flag of ingredient items. */
export class ShoppingListMarkIngredientItemsCommand {
  public readonly changes: CookidooOwnershipChange[];

  constructor(input: { changes: CookidooOwnershipChange[] }) {
    this.changes = input.changes;
  }
}
