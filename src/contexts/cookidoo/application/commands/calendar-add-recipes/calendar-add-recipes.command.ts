/** Command: add the given recipes to the calendar on the given day. */
export class CalendarAddRecipesCommand {
  public readonly day: string;
  public readonly recipeIds: string[];

  constructor(input: { day: string; recipeIds: string[] }) {
    this.day = input.day;
    this.recipeIds = input.recipeIds;
  }
}
