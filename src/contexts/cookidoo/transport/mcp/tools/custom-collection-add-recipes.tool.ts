import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CustomCollectionAddRecipesCommand } from '@contexts/cookidoo/application/commands/custom-collection-add-recipes/custom-collection-add-recipes.command';
import { customCollectionAddRecipesSchema } from '../schemas/collection.schema';

@McpTool()
@Injectable()
export class CustomCollectionAddRecipesMcpTool implements IMcpTool {
  private readonly logger = new Logger(CustomCollectionAddRecipesMcpTool.name);

  readonly name = 'cookidoo_add_recipes_to_custom_collection';
  readonly title = 'Add recipes to custom collection';
  readonly description =
    'Adds the given recipes to a custom collection. Returns the updated collection.';
  readonly inputSchema = customCollectionAddRecipesSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { collectionId, recipeIds } = args as {
      collectionId: string;
      recipeIds: string[];
    };
    this.logger.log(
      `Adding ${recipeIds.length} recipe(s) to collection ${collectionId}`,
    );
    const result = await this.commandBus.execute(
      new CustomCollectionAddRecipesCommand({ collectionId, recipeIds }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
