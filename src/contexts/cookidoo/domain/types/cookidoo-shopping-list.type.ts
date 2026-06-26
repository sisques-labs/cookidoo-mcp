/** An ingredient item on the shopping list, derived from added recipes. */
export interface CookidooIngredientItem {
  readonly id: string;
  readonly name: string;
  readonly isOwned: boolean;
  readonly description: string;
}

/** A free-text ("additional") item added manually to the shopping list. */
export interface CookidooAdditionalItem {
  readonly id: string;
  readonly name: string;
  readonly isOwned: boolean;
}
