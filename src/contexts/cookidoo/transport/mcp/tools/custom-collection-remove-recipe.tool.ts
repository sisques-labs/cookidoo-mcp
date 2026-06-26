import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CustomCollectionRemoveRecipeCommand } from '@contexts/cookidoo/application/commands/custom-collection-remove-recipe/custom-collection-remove-recipe.command';
import { customCollectionRemoveRecipeSchema } from '../schemas/collection.schema';

@McpTool()
@Injectable()
export class CustomCollectionRemoveRecipeMcpTool implements IMcpTool {
  private readonly logger = new Logger(
    CustomCollectionRemoveRecipeMcpTool.name,
  );

  readonly name = 'cookidoo_remove_recipe_from_custom_collection';
  readonly title = 'Remove recipe from custom collection';
  readonly description =
    'Removes a single recipe from a custom collection. Returns the updated collection.';
  readonly inputSchema = customCollectionRemoveRecipeSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { collectionId, recipeId } = args as {
      collectionId: string;
      recipeId: string;
    };
    this.logger.log(
      `Removing recipe ${recipeId} from collection ${collectionId}`,
    );
    const result = await this.commandBus.execute(
      new CustomCollectionRemoveRecipeCommand({ collectionId, recipeId }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
