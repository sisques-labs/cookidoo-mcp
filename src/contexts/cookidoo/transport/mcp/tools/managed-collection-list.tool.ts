import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ManagedCollectionFindAllQuery } from '@contexts/cookidoo/application/queries/managed-collection-find-all/managed-collection-find-all.query';
import { collectionPageSchema } from '../schemas/collection.schema';

@McpTool()
@Injectable()
export class ManagedCollectionListMcpTool implements IMcpTool {
  private readonly logger = new Logger(ManagedCollectionListMcpTool.name);

  readonly name = 'cookidoo_get_managed_collections';
  readonly title = 'Get managed collections';
  readonly description =
    'Returns a page of managed collections (subscribable Cookidoo collections), with their chapters and recipes.';
  readonly inputSchema = collectionPageSchema;

  constructor(private readonly queryBus: QueryBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { page } = args as { page?: number };
    this.logger.log(`Loading managed collections (page ${page ?? 0})`);
    const result = await this.queryBus.execute(
      new ManagedCollectionFindAllQuery({ page }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
