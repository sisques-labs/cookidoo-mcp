import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CustomCollectionRemoveCommand } from './custom-collection-remove.command';

@CommandHandler(CustomCollectionRemoveCommand)
export class CustomCollectionRemoveCommandHandler implements ICommandHandler<CustomCollectionRemoveCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(command: CustomCollectionRemoveCommand): Promise<void> {
    await this.client.removeCustomCollection(command.collectionId);
  }
}
