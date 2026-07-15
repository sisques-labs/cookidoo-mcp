import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCollection } from '@contexts/cookidoo/domain/types/cookidoo-collection.type';
import { CustomCollectionAddRecipesCommand } from './custom-collection-add-recipes.command';

@CommandHandler(CustomCollectionAddRecipesCommand)
export class CustomCollectionAddRecipesCommandHandler implements ICommandHandler<CustomCollectionAddRecipesCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: CustomCollectionAddRecipesCommand,
  ): Promise<CookidooCollection> {
    return this.client.addRecipesToCustomCollection(
      command.collectionId,
      command.recipeIds,
    );
  }
}
