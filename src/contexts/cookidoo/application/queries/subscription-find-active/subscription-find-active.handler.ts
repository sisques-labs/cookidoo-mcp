import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooSubscription } from '@contexts/cookidoo/domain/types/cookidoo-account.type';
import { SubscriptionFindActiveQuery } from './subscription-find-active.query';

@QueryHandler(SubscriptionFindActiveQuery)
export class SubscriptionFindActiveQueryHandler implements IQueryHandler<SubscriptionFindActiveQuery> {
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(): Promise<CookidooSubscription | null> {
    return this.client.getActiveSubscription();
  }
}
