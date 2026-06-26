import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { AccountFindUserInfoQuery } from '@contexts/cookidoo/application/queries/account-find-user-info/account-find-user-info.query';

@McpTool()
@Injectable()
export class AccountGetUserInfoMcpTool implements IMcpTool {
  private readonly logger = new Logger(AccountGetUserInfoMcpTool.name);

  readonly name = 'cookidoo_get_user_info';
  readonly title = 'Get Cookidoo account info';
  readonly description =
    'Returns the public profile (id, username, description, picture) of the configured Cookidoo account.';
  readonly inputSchema = {};

  constructor(private readonly queryBus: QueryBus) {}

  async execute(): Promise<CallToolResult> {
    this.logger.log('Loading user info');
    const result = await this.queryBus.execute(new AccountFindUserInfoQuery());
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
