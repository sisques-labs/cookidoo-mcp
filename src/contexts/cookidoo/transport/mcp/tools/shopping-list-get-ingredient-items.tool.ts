import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ShoppingListFindIngredientItemsQuery } from '@contexts/cookidoo/application/queries/shopping-list-find-ingredient-items/shopping-list-find-ingredient-items.query';

@McpTool()
@Injectable()
export class ShoppingListGetIngredientItemsMcpTool implements IMcpTool {
  private readonly logger = new Logger(
    ShoppingListGetIngredientItemsMcpTool.name,
  );

  readonly name = 'cookidoo_get_ingredient_items';
  readonly title = 'Get shopping list ingredient items';
  readonly description =
    'Returns the ingredient items currently on the Cookidoo shopping list (derived from added recipes), with quantity and owned state.';
  readonly inputSchema = {};

  constructor(private readonly queryBus: QueryBus) {}

  async execute(): Promise<CallToolResult> {
    this.logger.log('Loading ingredient items');
    const result = await this.queryBus.execute(
      new ShoppingListFindIngredientItemsQuery(),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
