import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CalendarFindWeekRecipesQuery } from '@contexts/cookidoo/application/queries/calendar-find-week-recipes/calendar-find-week-recipes.query';
import { calendarWeekSchema } from '../schemas/calendar.schema';

@McpTool()
@Injectable()
export class CalendarGetWeekMcpTool implements IMcpTool {
  private readonly logger = new Logger(CalendarGetWeekMcpTool.name);

  readonly name = 'cookidoo_get_calendar_week';
  readonly title = 'Get meal-planner calendar week';
  readonly description =
    'Returns the recipes planned on the Cookidoo meal-planner calendar for the week containing the given day. One entry per day of that week.';
  readonly inputSchema = calendarWeekSchema;

  constructor(private readonly queryBus: QueryBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { day } = args as { day: string };
    this.logger.log(`Loading calendar week for ${day}`);
    const result = await this.queryBus.execute(
      new CalendarFindWeekRecipesQuery({ day }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
