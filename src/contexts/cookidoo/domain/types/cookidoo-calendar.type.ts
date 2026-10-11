/** A recipe planned on a given day of the meal-planner calendar. */
export interface CookidooCalendarDayRecipe {
  readonly id: string;
  readonly name: string;
  readonly totalTime: number | null;
  readonly thumbnail: string | null;
  readonly image: string | null;
  readonly url: string;
  /** True for a user-created ("custom") recipe, false for a catalogue recipe. */
  readonly isCustom: boolean;
}

/** A single day of the meal-planner calendar, with its planned recipes. */
export interface CookidooCalendarDay {
  readonly id: string;
  readonly title: string;
  readonly recipes: CookidooCalendarDayRecipe[];
  /**
   * Ids of the custom recipes planned on this day. The planning endpoint
   * returns custom recipes only as ids, so they are absent from `recipes`
   * unless they were resolved (see `resolveCustomRecipes`).
   */
  readonly customerRecipeIds: string[];
}
