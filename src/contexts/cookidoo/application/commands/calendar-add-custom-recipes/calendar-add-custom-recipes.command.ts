/** Command: add the given custom recipes to the calendar on the given day. */
export class CalendarAddCustomRecipesCommand {
  public readonly day: string;
  public readonly recipeIds: string[];

  constructor(input: { day: string; recipeIds: string[] }) {
    this.day = input.day;
    this.recipeIds = input.recipeIds;
  }
}
