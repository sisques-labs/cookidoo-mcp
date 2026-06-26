import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { ManagedCollectionCountQuery } from '@contexts/cookidoo/application/queries/managed-collection-count/managed-collection-count.query';

@McpTool()
@Injectable()
export class ManagedCollectionCountMcpTool implements IMcpTool {
  private readonly logger = new Logger(ManagedCollectionCountMcpTool.name);

  readonly name = 'cookidoo_count_managed_collections';
  readonly title = 'Count managed collections';
  readonly description =
    'Returns the total number of managed collections and pages, for paginating cookidoo_get_managed_collections.';
  readonly inputSchema = {};

  constructor(private readonly queryBus: QueryBus) {}

  async execute(): Promise<CallToolResult> {
    this.logger.log('Counting managed collections');
    const result = await this.queryBus.execute(
      new ManagedCollectionCountQuery(),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
