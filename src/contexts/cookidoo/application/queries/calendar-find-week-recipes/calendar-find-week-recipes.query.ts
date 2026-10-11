/** Query: list the recipes planned on the calendar for the week of a day. */
export class CalendarFindWeekRecipesQuery {
  public readonly day: string;
  public readonly resolveCustomRecipes: boolean;

  constructor(input: { day: string; resolveCustomRecipes?: boolean }) {
    this.day = input.day;
    this.resolveCustomRecipes = input.resolveCustomRecipes ?? false;
  }
}
