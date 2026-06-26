import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CalendarAddCustomRecipesCommand } from '@contexts/cookidoo/application/commands/calendar-add-custom-recipes/calendar-add-custom-recipes.command';
import { calendarAddRecipesSchema } from '../schemas/calendar.schema';

@McpTool()
@Injectable()
export class CalendarAddCustomRecipesMcpTool implements IMcpTool {
  private readonly logger = new Logger(CalendarAddCustomRecipesMcpTool.name);

  readonly name = 'cookidoo_add_custom_recipes_to_calendar';
  readonly title = 'Add custom recipes to meal-planner calendar';
  readonly description =
    'Adds the given custom (user-created) recipes to the Cookidoo meal-planner calendar on the given day. Returns the updated calendar day.';
  readonly inputSchema = calendarAddRecipesSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { day, recipeIds } = args as { day: string; recipeIds: string[] };
    this.logger.log(`Adding ${recipeIds.length} custom recipe(s) to ${day}`);
    const result = await this.commandBus.execute(
      new CalendarAddCustomRecipesCommand({ day, recipeIds }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
