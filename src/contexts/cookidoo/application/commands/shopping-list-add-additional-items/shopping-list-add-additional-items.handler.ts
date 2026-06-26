import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooAdditionalItem } from '@contexts/cookidoo/domain/types/cookidoo-shopping-list.type';
import { ShoppingListAddAdditionalItemsCommand } from './shopping-list-add-additional-items.command';

@CommandHandler(ShoppingListAddAdditionalItemsCommand)
export class ShoppingListAddAdditionalItemsCommandHandler
  implements ICommandHandler<ShoppingListAddAdditionalItemsCommand>
{
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: ShoppingListAddAdditionalItemsCommand,
  ): Promise<CookidooAdditionalItem[]> {
    return this.client.addAdditionalItems(command.names);
  }
}
