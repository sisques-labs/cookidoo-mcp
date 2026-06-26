import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCollection } from '@contexts/cookidoo/domain/types/cookidoo-collection.type';
import { ManagedCollectionFindAllQuery } from './managed-collection-find-all.query';

@QueryHandler(ManagedCollectionFindAllQuery)
export class ManagedCollectionFindAllQueryHandler implements IQueryHandler<ManagedCollectionFindAllQuery> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    query: ManagedCollectionFindAllQuery,
  ): Promise<CookidooCollection[]> {
    return this.client.getManagedCollections(query.page);
  }
}
