/** Query: list the recipes planned on the calendar for the week of a day. */
export class CalendarFindWeekRecipesQuery {
  public readonly day: string;

  constructor(input: { day: string }) {
    this.day = input.day;
  }
}
