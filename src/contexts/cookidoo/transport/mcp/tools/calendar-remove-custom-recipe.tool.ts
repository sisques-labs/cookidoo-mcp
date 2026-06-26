import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '@core/mcp/domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '@core/mcp/domain/interfaces/mcp-tool.interface';
import { CalendarRemoveCustomRecipeCommand } from '@contexts/cookidoo/application/commands/calendar-remove-custom-recipe/calendar-remove-custom-recipe.command';
import { calendarRemoveRecipeSchema } from '../schemas/calendar.schema';

@McpTool()
@Injectable()
export class CalendarRemoveCustomRecipeMcpTool implements IMcpTool {
  private readonly logger = new Logger(CalendarRemoveCustomRecipeMcpTool.name);

  readonly name = 'cookidoo_remove_custom_recipe_from_calendar';
  readonly title = 'Remove custom recipe from meal-planner calendar';
  readonly description =
    'Removes a single custom (user-created) recipe from the Cookidoo meal-planner calendar on the given day. Returns the updated calendar day.';
  readonly inputSchema = calendarRemoveRecipeSchema;

  constructor(private readonly commandBus: CommandBus) {}

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { day, recipeId } = args as { day: string; recipeId: string };
    this.logger.log(`Removing custom recipe ${recipeId} from ${day}`);
    const result = await this.commandBus.execute(
      new CalendarRemoveCustomRecipeCommand({ day, recipeId }),
    );
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  }
}
