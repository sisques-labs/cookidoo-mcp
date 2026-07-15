import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ShoppingListRemoveCustomRecipeIngredientsCommand } from '@contexts/cookidoo/application/commands/shopping-list-remove-custom-recipe-ingredients/shopping-list-remove-custom-recipe-ingredients.command';
import { recipeIdsSchema } from '../schemas/recipe-ids.schema';

@McpTool()
@Injectable()
export class ShoppingListRemoveCustomRecipeIngredientsMcpTool implements IMcpTool {
  private readonly logger = new Logger(
    ShoppingListRemoveCustomRecipeIngredientsMcpTool.name,
  );

  readonly name = 'cookidoo_remove_custom_recipe_ingredients';
  readonly title = 'Remove custom-recipe ingredients from shopping list';
  readonly description =
    'Removes the ingredients of the given custom (user-created) recipes from the Cookidoo shopping list.';
  readonly inputSchema = recipeIdsSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { recipeIds } = args as { recipeIds: string[] };
    this.logger.log(
      `Removing ingredients for ${recipeIds.length} custom recipe(s)`,
    );
    await this.commandBus.execute(
      new ShoppingListRemoveCustomRecipeIngredientsCommand({ recipeIds }),
    );
    return {
      content: [{ type: 'text', text: JSON.stringify({ removed: recipeIds }) }],
    };
  }
}
