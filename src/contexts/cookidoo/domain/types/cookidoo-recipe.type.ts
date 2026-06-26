/** Thermomix machine versions usable as a search filter. */
export type ThermomixMachineType = 'TM5' | 'TM6' | 'TM7' | 'TM31';

/** A single ingredient line, with a human-readable quantity/unit description. */
export interface CookidooIngredient {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

/** A recipe as it appears attached to the shopping list. */
export interface CookidooShoppingRecipe {
  readonly id: string;
  readonly name: string;
  readonly ingredients: CookidooIngredient[];
  readonly thumbnail: string | null;
  readonly image: string | null;
  readonly url: string;
}

/** A single recipe hit returned by the search endpoint. */
export interface CookidooSearchRecipeHit {
  readonly id: string;
  readonly name: string;
  readonly thumbnail: string | null;
  readonly image: string | null;
  readonly url: string;
}

/** A page of search results plus the reported total. */
export interface CookidooSearchResult {
  readonly recipes: CookidooSearchRecipeHit[];
  readonly total: number;
}

/** Detailed view of a single recipe (core subset of the upstream payload). */
export interface CookidooRecipeDetails {
  readonly id: string;
  readonly name: string;
  readonly ingredients: CookidooIngredient[];
  readonly difficulty: string | null;
  readonly notes: string[];
  readonly utensils: string[];
  readonly servingSize: number;
  readonly activeTime: number | null;
  readonly totalTime: number | null;
  readonly thumbnail: string | null;
  readonly image: string | null;
  readonly url: string;
}

/** Filters accepted by {@link ICookidooClient.searchRecipes}. */
export interface CookidooSearchParams {
  readonly query?: string;
  readonly locale?: string;
  readonly ingredients?: string[];
  readonly excludeIngredients?: string[];
  readonly categories?: string[];
  readonly tags?: string[];
  readonly difficulty?: string;
  readonly preparationTime?: number;
  readonly totalTime?: number;
  readonly portions?: number;
  readonly page?: number;
  readonly pageSize?: number;
  readonly tmv?: ThermomixMachineType[];
}
