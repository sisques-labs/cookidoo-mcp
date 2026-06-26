import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ShoppingListRemoveRecipeIngredientsCommand } from '@contexts/cookidoo/application/commands/shopping-list-remove-recipe-ingredients/shopping-list-remove-recipe-ingredients.command';
import { recipeIdsSchema } from '../schemas/recipe-ids.schema';

@McpTool()
@Injectable()
export class ShoppingListRemoveRecipeIngredientsMcpTool implements IMcpTool {
  private readonly logger = new Logger(
    ShoppingListRemoveRecipeIngredientsMcpTool.name,
  );

  readonly name = 'cookidoo_remove_recipe_ingredients';
  readonly title = 'Remove recipe ingredients from shopping list';
  readonly description =
    'Removes the ingredients of the given recipes from the Cookidoo shopping list.';
  readonly inputSchema = recipeIdsSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { recipeIds } = args as { recipeIds: string[] };
    this.logger.log(`Removing ingredients for ${recipeIds.length} recipe(s)`);
    await this.commandBus.execute(
      new ShoppingListRemoveRecipeIngredientsCommand({ recipeIds }),
    );
    return {
      content: [{ type: 'text', text: JSON.stringify({ removed: recipeIds }) }],
    };
  }
}
