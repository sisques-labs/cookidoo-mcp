import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  COOKIDOO_CLIENT,
  ICookidooClient,
} from '@contexts/cookidoo/domain/interfaces/cookidoo-client.interface';
import { CookidooUserInfo } from '@contexts/cookidoo/domain/types/cookidoo-account.type';
import { AccountFindUserInfoQuery } from './account-find-user-info.query';

@QueryHandler(AccountFindUserInfoQuery)
export class AccountFindUserInfoQueryHandler
  implements IQueryHandler<AccountFindUserInfoQuery>
{
  constructor(
    @Inject(COOKIDOO_CLIENT) private readonly client: ICookidooClient,
  ) {}

  async execute(): Promise<CookidooUserInfo> {
    return this.client.getUserInfo();
  }
}
