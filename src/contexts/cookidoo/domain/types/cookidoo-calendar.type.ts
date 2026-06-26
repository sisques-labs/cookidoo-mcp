/** A recipe planned on a given day of the meal-planner calendar. */
export interface CookidooCalendarDayRecipe {
  readonly id: string;
  readonly name: string;
  readonly totalTime: number | null;
  readonly thumbnail: string | null;
  readonly image: string | null;
  readonly url: string;
}

/** A single day of the meal-planner calendar, with its planned recipes. */
export interface CookidooCalendarDay {
  readonly id: string;
  readonly title: string;
  readonly recipes: CookidooCalendarDayRecipe[];
  readonly customerRecipeIds: string[];
}
