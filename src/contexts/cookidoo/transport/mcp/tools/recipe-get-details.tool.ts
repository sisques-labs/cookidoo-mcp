import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { RecipeFindDetailsQuery } from '@contexts/cookidoo/application/queries/recipe-find-details/recipe-find-details.query';
import { recipeFindDetailsSchema } from '../schemas/recipe-find-details.schema';

@McpTool()
@Injectable()
export class RecipeGetDetailsMcpTool implements IMcpTool {
  private readonly logger = new Logger(RecipeGetDetailsMcpTool.name);

  readonly name = 'cookidoo_get_recipe_details';
  readonly title = 'Get Cookidoo recipe details';
  readonly description =
    'Returns the full details of a single recipe by id: ingredients, utensils, notes, difficulty, serving size, active/total time and image URLs.';
  readonly inputSchema = recipeFindDetailsSchema;

  constructor(private readonly queryBus: QueryBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { id } = args as { id: string };
    this.logger.log(`Loading recipe details: ${id}`);
    const result = await this.queryBus.execute(new RecipeFindDetailsQuery({ id }));
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
