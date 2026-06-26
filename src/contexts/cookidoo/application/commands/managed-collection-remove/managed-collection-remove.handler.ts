import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { ManagedCollectionRemoveCommand } from './managed-collection-remove.command';

@CommandHandler(ManagedCollectionRemoveCommand)
export class ManagedCollectionRemoveCommandHandler implements ICommandHandler<ManagedCollectionRemoveCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(command: ManagedCollectionRemoveCommand): Promise<void> {
    await this.client.removeManagedCollection(command.collectionId);
  }
}
