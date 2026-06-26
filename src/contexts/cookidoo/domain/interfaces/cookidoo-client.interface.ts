import {
  CookidooSubscription,
  CookidooUserInfo,
} from '../types/cookidoo-account.type';
import {
  CookidooRecipeDetails,
  CookidooSearchParams,
  CookidooSearchResult,
  CookidooShoppingRecipe,
} from '../types/cookidoo-recipe.type';
import {
  CookidooAdditionalItem,
  CookidooIngredientItem,
} from '../types/cookidoo-shopping-list.type';

/** DI token for the {@link ICookidooClient} port. */
export const COOKIDOO_CLIENT = Symbol('COOKIDOO_CLIENT');

/**
 * Port to the Cookidoo backend.
 *
 * The application layer (commands/queries) depends only on this interface; the
 * concrete HTTP adapter lives in `infrastructure/`. Authentication is handled
 * transparently by the adapter (lazy login + re-login on expiry), so callers
 * never deal with sessions or cookies.
 */
export interface ICookidooClient {
  /** Public profile of the configured account. */
  getUserInfo(): Promise<CookidooUserInfo>;

  /** The active subscription, or `null` if none is active. */
  getActiveSubscription(): Promise<CookidooSubscription | null>;

  /** Full details of a single recipe by id. */
  getRecipeDetails(id: string): Promise<CookidooRecipeDetails>;

  /** Search the recipe catalogue with optional filters. */
  searchRecipes(params: CookidooSearchParams): Promise<CookidooSearchResult>;

  /** Recipes currently attached to the shopping list. */
  getShoppingListRecipes(): Promise<CookidooShoppingRecipe[]>;

  /** Ingredient items currently on the shopping list. */
  getIngredientItems(): Promise<CookidooIngredientItem[]>;

  /** Add the ingredients of the given recipes to the shopping list. */
  addIngredientItemsForRecipes(
    recipeIds: string[],
  ): Promise<CookidooIngredientItem[]>;

  /** Remove the ingredients of the given recipes from the shopping list. */
  removeIngredientItemsForRecipes(recipeIds: string[]): Promise<void>;

  /** Free-text ("additional") items on the shopping list. */
  getAdditionalItems(): Promise<CookidooAdditionalItem[]>;

  /** Add free-text items to the shopping list (created as not-owned). */
  addAdditionalItems(names: string[]): Promise<CookidooAdditionalItem[]>;

  /** Remove free-text items from the shopping list by id. */
  removeAdditionalItems(ids: string[]): Promise<void>;

  /** Remove every recipe, ingredient and additional item from the list. */
  clearShoppingList(): Promise<void>;
}
