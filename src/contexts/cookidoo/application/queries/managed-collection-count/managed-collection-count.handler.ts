import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCollectionPage } from '@contexts/cookidoo/domain/types/cookidoo-collection.type';
import { ManagedCollectionCountQuery } from './managed-collection-count.query';

@QueryHandler(ManagedCollectionCountQuery)
export class ManagedCollectionCountQueryHandler implements IQueryHandler<ManagedCollectionCountQuery> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(): Promise<CookidooCollectionPage> {
    return this.client.countManagedCollections();
  }
}
