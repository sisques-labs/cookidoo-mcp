import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCollection } from '@contexts/cookidoo/domain/types/cookidoo-collection.type';
import { CustomCollectionRemoveRecipeCommand } from './custom-collection-remove-recipe.command';

@CommandHandler(CustomCollectionRemoveRecipeCommand)
export class CustomCollectionRemoveRecipeCommandHandler implements ICommandHandler<CustomCollectionRemoveRecipeCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: CustomCollectionRemoveRecipeCommand,
  ): Promise<CookidooCollection> {
    return this.client.removeRecipeFromCustomCollection(
      command.collectionId,
      command.recipeId,
    );
  }
}
