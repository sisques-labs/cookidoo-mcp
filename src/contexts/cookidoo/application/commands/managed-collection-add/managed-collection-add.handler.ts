import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCollection } from '@contexts/cookidoo/domain/types/cookidoo-collection.type';
import { ManagedCollectionAddCommand } from './managed-collection-add.command';

@CommandHandler(ManagedCollectionAddCommand)
export class ManagedCollectionAddCommandHandler implements ICommandHandler<ManagedCollectionAddCommand> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    command: ManagedCollectionAddCommand,
  ): Promise<CookidooCollection> {
    return this.client.addManagedCollection(command.collectionId);
  }
}
