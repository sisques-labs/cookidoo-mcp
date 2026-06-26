import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { RecipeSearchQuery } from '@contexts/cookidoo/application/queries/recipe-search/recipe-search.query';
import { CookidooSearchParams } from '@contexts/cookidoo/domain/types/cookidoo-recipe.type';
import { recipeSearchSchema } from '../schemas/recipe-search.schema';

@McpTool()
@Injectable()
export class RecipeSearchMcpTool implements IMcpTool {
  private readonly logger = new Logger(RecipeSearchMcpTool.name);

  readonly name = 'cookidoo_search_recipes';
  readonly title = 'Search Cookidoo recipes';
  readonly description =
    'Searches the Cookidoo recipe catalogue with optional filters (query, ingredients, difficulty, time, Thermomix version, …). Returns recipe hits and the total match count.';
  readonly inputSchema = recipeSearchSchema;

  constructor(private readonly queryBus: QueryBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const params = args as CookidooSearchParams;
    this.logger.log(`Searching recipes: ${params.query ?? '(no query)'}`);
    const result = await this.queryBus.execute(new RecipeSearchQuery(params));
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
