import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCollection } from '@contexts/cookidoo/domain/types/cookidoo-collection.type';
import { CustomCollectionAddCommand } from './custom-collection-add.command';

@CommandHandler(CustomCollectionAddCommand)
export class CustomCollectionAddCommandHandler implements ICommandHandler<CustomCollectionAddCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: CustomCollectionAddCommand,
  ): Promise<CookidooCollection> {
    return this.client.addCustomCollection(command.name);
  }
}
