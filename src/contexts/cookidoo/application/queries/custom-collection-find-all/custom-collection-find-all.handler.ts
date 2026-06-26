import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooCollection } from '@contexts/cookidoo/domain/types/cookidoo-collection.type';
import { CustomCollectionFindAllQuery } from './custom-collection-find-all.query';

@QueryHandler(CustomCollectionFindAllQuery)
export class CustomCollectionFindAllQueryHandler implements IQueryHandler<CustomCollectionFindAllQuery> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(
    query: CustomCollectionFindAllQuery,
  ): Promise<CookidooCollection[]> {
    return this.client.getCustomCollections(query.page);
  }
}
