import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CustomRecipeFindAllQuery } from '@contexts/cookidoo/application/queries/custom-recipe-find-all/custom-recipe-find-all.query';

@McpTool()
@Injectable()
export class CustomRecipeListMcpTool implements IMcpTool {
  private readonly logger = new Logger(CustomRecipeListMcpTool.name);

  readonly name = 'cookidoo_list_custom_recipes';
  readonly title = 'List custom recipes';
  readonly description =
    'Returns all the user-created ("custom") recipes on the Cookidoo account.';
  readonly inputSchema = {};

  constructor(private readonly queryBus: QueryBus) {}

  async execute(): Promise<CallToolResult> {
    this.logger.log('Listing custom recipes');
    const result = await this.queryBus.execute(new CustomRecipeFindAllQuery());
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
