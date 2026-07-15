import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CustomRecipeAddCommand } from '@contexts/cookidoo/application/commands/custom-recipe-add/custom-recipe-add.command';
import { customRecipeAddSchema } from '../schemas/custom-recipe.schema';

@McpTool()
@Injectable()
export class CustomRecipeAddMcpTool implements IMcpTool {
  private readonly logger = new Logger(CustomRecipeAddMcpTool.name);

  readonly name = 'cookidoo_add_custom_recipe';
  readonly title = 'Add custom recipe';
  readonly description =
    'Creates a custom recipe derived from an existing recipe and a serving size. Returns the created custom recipe.';
  readonly inputSchema = customRecipeAddSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { recipeId, servingSize } = args as {
      recipeId: string;
      servingSize: number;
    };
    this.logger.log(`Creating custom recipe from ${recipeId}`);
    const result = await this.commandBus.execute(
      new CustomRecipeAddCommand({ recipeId, servingSize }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
