import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CustomCollectionFindAllQuery } from '@contexts/cookidoo/application/queries/custom-collection-find-all/custom-collection-find-all.query';
import { collectionPageSchema } from '../schemas/collection.schema';

@McpTool()
@Injectable()
export class CustomCollectionListMcpTool implements IMcpTool {
  private readonly logger = new Logger(CustomCollectionListMcpTool.name);

  readonly name = 'cookidoo_get_custom_collections';
  readonly title = 'Get custom collections';
  readonly description =
    "Returns a page of the user's own ('custom') collections, with their chapters and recipes.";
  readonly inputSchema = collectionPageSchema;

  constructor(private readonly queryBus: QueryBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { page } = args as { page?: number };
    this.logger.log(`Loading custom collections (page ${page ?? 0})`);
    const result = await this.queryBus.execute(
      new CustomCollectionFindAllQuery({ page }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
