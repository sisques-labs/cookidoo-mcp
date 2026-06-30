/** A recipe as listed inside a collection chapter. */
export interface CookidooChapterRecipe {
  readonly id: string;
  readonly name: string;
  readonly totalTime: number;
  readonly url: string;
}

/** A chapter (group of recipes) within a collection. */
export interface CookidooChapter {
  readonly name: string;
  readonly recipes: CookidooChapterRecipe[];
}

/** A collection (managed or custom) of recipes, organised in chapters. */
export interface CookidooCollection {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly chapters: CookidooChapter[];
}

/** Pagination summary returned by the collection count endpoints. */
export interface CookidooCollectionPage {
  readonly totalElements: number;
  readonly totalPages: number;
}
