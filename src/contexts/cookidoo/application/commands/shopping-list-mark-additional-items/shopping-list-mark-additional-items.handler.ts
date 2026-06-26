import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooAdditionalItem } from '@contexts/cookidoo/domain/types/cookidoo-shopping-list.type';
import { ShoppingListMarkAdditionalItemsCommand } from './shopping-list-mark-additional-items.command';

@CommandHandler(ShoppingListMarkAdditionalItemsCommand)
export class ShoppingListMarkAdditionalItemsCommandHandler implements ICommandHandler<ShoppingListMarkAdditionalItemsCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: ShoppingListMarkAdditionalItemsCommand,
  ): Promise<CookidooAdditionalItem[]> {
    return this.client.editAdditionalItemsOwnership(command.changes);
  }
}
