import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ShoppingListAddRecipeIngredientsCommand } from '@contexts/cookidoo/application/commands/shopping-list-add-recipe-ingredients/shopping-list-add-recipe-ingredients.command';
import { recipeIdsSchema } from '../schemas/recipe-ids.schema';

@McpTool()
@Injectable()
export class ShoppingListAddRecipeIngredientsMcpTool implements IMcpTool {
  private readonly logger = new Logger(
    ShoppingListAddRecipeIngredientsMcpTool.name,
  );

  readonly name = 'cookidoo_add_recipe_ingredients';
  readonly title = 'Add recipe ingredients to shopping list';
  readonly description =
    'Adds the ingredients of the given recipes to the Cookidoo shopping list. Returns the added ingredient items.';
  readonly inputSchema = recipeIdsSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { recipeIds } = args as { recipeIds: string[] };
    this.logger.log(`Adding ingredients for ${recipeIds.length} recipe(s)`);
    const result = await this.commandBus.execute(
      new ShoppingListAddRecipeIngredientsCommand({ recipeIds }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
