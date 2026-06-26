import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ShoppingListFindRecipesQuery } from '@contexts/cookidoo/application/queries/shopping-list-find-recipes/shopping-list-find-recipes.query';

@McpTool()
@Injectable()
export class ShoppingListGetRecipesMcpTool implements IMcpTool {
  private readonly logger = new Logger(ShoppingListGetRecipesMcpTool.name);

  readonly name = 'cookidoo_get_shopping_list_recipes';
  readonly title = 'Get shopping list recipes';
  readonly description =
    'Returns the recipes currently attached to the Cookidoo shopping list, including their ingredients.';
  readonly inputSchema = {};

  constructor(private readonly queryBus: QueryBus) {}

  async execute(): Promise<CallToolResult> {
    this.logger.log('Loading shopping list recipes');
    const result = await this.queryBus.execute(
      new ShoppingListFindRecipesQuery(),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
