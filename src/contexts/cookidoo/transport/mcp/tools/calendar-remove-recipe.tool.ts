import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CalendarRemoveRecipeCommand } from '@contexts/cookidoo/application/commands/calendar-remove-recipe/calendar-remove-recipe.command';
import { calendarRemoveRecipeSchema } from '../schemas/calendar.schema';

@McpTool()
@Injectable()
export class CalendarRemoveRecipeMcpTool implements IMcpTool {
  private readonly logger = new Logger(CalendarRemoveRecipeMcpTool.name);

  readonly name = 'cookidoo_remove_recipe_from_calendar';
  readonly title = 'Remove recipe from meal-planner calendar';
  readonly description =
    'Removes a single recipe from the Cookidoo meal-planner calendar on the given day. Returns the updated calendar day.';
  readonly inputSchema = calendarRemoveRecipeSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { day, recipeId } = args as { day: string; recipeId: string };
    this.logger.log(`Removing recipe ${recipeId} from ${day}`);
    const result = await this.commandBus.execute(
      new CalendarRemoveRecipeCommand({ day, recipeId }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
