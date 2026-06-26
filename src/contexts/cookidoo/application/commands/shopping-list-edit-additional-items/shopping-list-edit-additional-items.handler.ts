import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooAdditionalItem } from '@contexts/cookidoo/domain/types/cookidoo-shopping-list.type';
import { ShoppingListEditAdditionalItemsCommand } from './shopping-list-edit-additional-items.command';

@CommandHandler(ShoppingListEditAdditionalItemsCommand)
export class ShoppingListEditAdditionalItemsCommandHandler implements ICommandHandler<ShoppingListEditAdditionalItemsCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: ShoppingListEditAdditionalItemsCommand,
  ): Promise<CookidooAdditionalItem[]> {
    return this.client.editAdditionalItems(command.edits);
  }
}
