/** Command: remove a single recipe from the calendar on the given day. */
export class CalendarRemoveRecipeCommand {
  public readonly day: string;
  public readonly recipeId: string;

  constructor(input: { day: string; recipeId: string }) {
    this.day = input.day;
    this.recipeId = input.recipeId;
  }
}
