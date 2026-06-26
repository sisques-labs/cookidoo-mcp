import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CustomCollectionCountQuery } from '@contexts/cookidoo/application/queries/custom-collection-count/custom-collection-count.query';

@McpTool()
@Injectable()
export class CustomCollectionCountMcpTool implements IMcpTool {
  private readonly logger = new Logger(CustomCollectionCountMcpTool.name);

  readonly name = 'cookidoo_count_custom_collections';
  readonly title = 'Count custom collections';
  readonly description =
    'Returns the total number of custom collections and pages, for paginating cookidoo_get_custom_collections.';
  readonly inputSchema = {};

  constructor(private readonly queryBus: QueryBus) {}

  async execute(): Promise<CallToolResult> {
    this.logger.log('Counting custom collections');
    const result = await this.queryBus.execute(
      new CustomCollectionCountQuery(),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
