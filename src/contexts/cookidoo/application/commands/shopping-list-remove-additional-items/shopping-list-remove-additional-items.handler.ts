import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { ShoppingListRemoveAdditionalItemsCommand } from './shopping-list-remove-additional-items.command';

@CommandHandler(ShoppingListRemoveAdditionalItemsCommand)
export class ShoppingListRemoveAdditionalItemsCommandHandler implements ICommandHandler<ShoppingListRemoveAdditionalItemsCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: ShoppingListRemoveAdditionalItemsCommand,
  ): Promise<void> {
    await this.client.removeAdditionalItems(command.ids);
  }
}
