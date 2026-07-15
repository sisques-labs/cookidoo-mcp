/** A user-created ("custom") recipe stored under created-recipes. */
export interface CookidooCustomRecipe {
  readonly id: string;
  readonly name: string;
  readonly ingredients: string[];
  readonly instructions: string[];
  readonly servingSize: number;
  /** Total time in seconds (0 when unknown). */
  readonly totalTime: number;
  /** Active/preparation time in seconds (0 when unknown). */
  readonly activeTime: number;
  readonly tools: string[];
  readonly thumbnail: string | null;
  readonly image: string | null;
  readonly url: string;
}
