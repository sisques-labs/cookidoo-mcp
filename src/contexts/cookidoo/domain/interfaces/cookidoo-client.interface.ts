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
import { CookidooCalendarDay } from '../types/cookidoo-calendar.type';
import { CookidooCustomRecipe } from '../types/cookidoo-custom-recipe.type';
import {
  CookidooCollection,
  CookidooCollectionPage,
} from '../types/cookidoo-collection.type';

/** Ownership change for a shopping-list item ("bought" / "not bought"). */
export interface CookidooOwnershipChange {
  readonly id: string;
  readonly isOwned: boolean;
}

/** A rename of a free-text ("additional") shopping-list item. */
export interface CookidooAdditionalItemEdit {
  readonly id: string;
  readonly name: string;
}

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

  /**
   * Recipes planned on the meal-planner calendar for the week containing the
   * given day (ISO `YYYY-MM-DD`). Returns one entry per day of that week.
   */
  getRecipesInCalendarWeek(day: string): Promise<CookidooCalendarDay[]>;

  /**
   * Add the given recipes to the meal-planner calendar on the given day (ISO
   * `YYYY-MM-DD`). Returns the updated calendar day.
   */
  addRecipesToCalendar(
    day: string,
    recipeIds: string[],
  ): Promise<CookidooCalendarDay>;

  /**
   * Remove a single recipe from the meal-planner calendar on the given day (ISO
   * `YYYY-MM-DD`). Returns the updated calendar day.
   */
  removeRecipeFromCalendar(
    day: string,
    recipeId: string,
  ): Promise<CookidooCalendarDay>;

  /** Mark ingredient items as owned/not-owned ("bought") on the shopping list. */
  editIngredientItemsOwnership(
    changes: CookidooOwnershipChange[],
  ): Promise<CookidooIngredientItem[]>;

  /** Add the ingredients of the given custom recipes to the shopping list. */
  addIngredientItemsForCustomRecipes(
    recipeIds: string[],
  ): Promise<CookidooIngredientItem[]>;

  /** Remove the ingredients of the given custom recipes from the shopping list. */
  removeIngredientItemsForCustomRecipes(recipeIds: string[]): Promise<void>;

  /** Rename free-text ("additional") shopping-list items. */
  editAdditionalItems(
    edits: CookidooAdditionalItemEdit[],
  ): Promise<CookidooAdditionalItem[]>;

  /** Mark free-text items as owned/not-owned ("bought") on the shopping list. */
  editAdditionalItemsOwnership(
    changes: CookidooOwnershipChange[],
  ): Promise<CookidooAdditionalItem[]>;

  /** Add custom recipes to the meal-planner calendar on the given day. */
  addCustomRecipesToCalendar(
    day: string,
    recipeIds: string[],
  ): Promise<CookidooCalendarDay>;

  /** Remove a single custom recipe from the calendar on the given day. */
  removeCustomRecipeFromCalendar(
    day: string,
    recipeId: string,
  ): Promise<CookidooCalendarDay>;

  /** All user-created ("custom") recipes. */
  listCustomRecipes(): Promise<CookidooCustomRecipe[]>;

  /** A single custom recipe by id. */
  getCustomRecipe(id: string): Promise<CookidooCustomRecipe>;

  /** Create a custom recipe derived from an existing recipe + serving size. */
  addCustomRecipeFrom(
    recipeId: string,
    servingSize: number,
  ): Promise<CookidooCustomRecipe>;

  /** Delete a custom recipe by id. */
  removeCustomRecipe(id: string): Promise<void>;

  /** Total elements/pages of managed collections (for pagination). */
  countManagedCollections(): Promise<CookidooCollectionPage>;

  /** A page of managed collections (subscribable Cookidoo collections). */
  getManagedCollections(page?: number): Promise<CookidooCollection[]>;

  /** Subscribe to a managed collection by id. */
  addManagedCollection(collectionId: string): Promise<CookidooCollection>;

  /** Unsubscribe from a managed collection by id. */
  removeManagedCollection(collectionId: string): Promise<void>;

  /** Total elements/pages of custom collections (for pagination). */
  countCustomCollections(): Promise<CookidooCollectionPage>;

  /** A page of the user's own ("custom") collections. */
  getCustomCollections(page?: number): Promise<CookidooCollection[]>;

  /** Create a custom collection with the given name. */
  addCustomCollection(name: string): Promise<CookidooCollection>;

  /** Delete a custom collection by id. */
  removeCustomCollection(collectionId: string): Promise<void>;

  /** Add recipes to a custom collection. */
  addRecipesToCustomCollection(
    collectionId: string,
    recipeIds: string[],
  ): Promise<CookidooCollection>;

  /** Remove a single recipe from a custom collection. */
  removeRecipeFromCustomCollection(
    collectionId: string,
    recipeId: string,
  ): Promise<CookidooCollection>;
}
