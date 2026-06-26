import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { ShoppingListClearCommand } from './shopping-list-clear.command';

@CommandHandler(ShoppingListClearCommand)
export class ShoppingListClearCommandHandler implements ICommandHandler<ShoppingListClearCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(): Promise<void> {
    await this.client.clearShoppingList();
  }
}
