import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CustomRecipeRemoveCommand } from '@contexts/cookidoo/application/commands/custom-recipe-remove/custom-recipe-remove.command';
import { customRecipeIdSchema } from '../schemas/custom-recipe.schema';

@McpTool()
@Injectable()
export class CustomRecipeRemoveMcpTool implements IMcpTool {
  private readonly logger = new Logger(CustomRecipeRemoveMcpTool.name);

  readonly name = 'cookidoo_remove_custom_recipe';
  readonly title = 'Remove custom recipe';
  readonly description = 'Deletes a user-created ("custom") recipe by id.';
  readonly inputSchema = customRecipeIdSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { id } = args as { id: string };
    this.logger.log(`Removing custom recipe: ${id}`);
    await this.commandBus.execute(new CustomRecipeRemoveCommand({ id }));
    return {
      content: [{ type: 'text', text: JSON.stringify({ removed: id }) }],
    };
  }
}
