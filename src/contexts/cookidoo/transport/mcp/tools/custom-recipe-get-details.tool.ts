import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CustomRecipeFindDetailsQuery } from '@contexts/cookidoo/application/queries/custom-recipe-find-details/custom-recipe-find-details.query';
import { customRecipeIdSchema } from '../schemas/custom-recipe.schema';

@McpTool()
@Injectable()
export class CustomRecipeGetDetailsMcpTool implements IMcpTool {
  private readonly logger = new Logger(CustomRecipeGetDetailsMcpTool.name);

  readonly name = 'cookidoo_get_custom_recipe';
  readonly title = 'Get custom recipe details';
  readonly description =
    'Returns the full details of a single user-created ("custom") recipe by id.';
  readonly inputSchema = customRecipeIdSchema;

  constructor(private readonly queryBus: QueryBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { id } = args as { id: string };
    this.logger.log(`Loading custom recipe: ${id}`);
    const result = await this.queryBus.execute(
      new CustomRecipeFindDetailsQuery({ id }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
