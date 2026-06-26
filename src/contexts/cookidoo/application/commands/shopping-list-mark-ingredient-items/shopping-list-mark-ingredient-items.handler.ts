import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooIngredientItem } from '@contexts/cookidoo/domain/types/cookidoo-shopping-list.type';
import { ShoppingListMarkIngredientItemsCommand } from './shopping-list-mark-ingredient-items.command';

@CommandHandler(ShoppingListMarkIngredientItemsCommand)
export class ShoppingListMarkIngredientItemsCommandHandler implements ICommandHandler<ShoppingListMarkIngredientItemsCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: ShoppingListMarkIngredientItemsCommand,
  ): Promise<CookidooIngredientItem[]> {
    return this.client.editIngredientItemsOwnership(command.changes);
  }
}
