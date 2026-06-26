/**
 * Cookidoo API constants, ported from the upstream `cookidoo_api/const.py`.
 *
 * Paths contain a `{language}` placeholder filled per request from the
 * configured localization. They are resolved against the API endpoint derived
 * from the localization URL (e.g. `https://cookidoo.ch`).
 */

export const DEFAULT_API_HEADERS: Readonly<Record<string, string>> = {
  Accept: 'application/json',
};

export const CIAM_LOGIN_SRV_URL =
  'https://ciam.prod.cookidoo.vorwerk-digital.com/login-srv/login';

export const LOGIN_PATH = 'profile/{language}/login';
export const LOGIN_REDIRECT = '%2Ffoundation%2F{language}%2Ffor-you';

export const RECIPE_PATH = 'recipes/recipe/{language}/{id}';

export const SHOPPING_LIST_RECIPES_PATH = 'shopping/{language}';
export const INGREDIENT_ITEMS_PATH = 'shopping/{language}';
export const ADD_INGREDIENT_ITEMS_FOR_RECIPES_PATH =
  'shopping/{language}/recipes/add';
export const REMOVE_INGREDIENT_ITEMS_FOR_RECIPES_PATH =
  'shopping/{language}/recipes/remove';

export const EDIT_OWNERSHIP_INGREDIENT_ITEMS_PATH =
  'shopping/{language}/owned-ingredients/ownership/edit';

export const ADDITIONAL_ITEMS_PATH = 'shopping/{language}';
export const ADD_ADDITIONAL_ITEMS_PATH =
  'shopping/{language}/additional-items/add';
export const EDIT_ADDITIONAL_ITEMS_PATH =
  'shopping/{language}/additional-items/edit';
export const EDIT_OWNERSHIP_ADDITIONAL_ITEMS_PATH =
  'shopping/{language}/additional-items/ownership/edit';
export const REMOVE_ADDITIONAL_ITEMS_PATH =
  'shopping/{language}/additional-items/remove';

export const COMMUNITY_PROFILE_PATH = 'community/profile';
export const SUBSCRIPTIONS_PATH = 'ownership/subscriptions';

export const RECIPES_IN_CALENDAR_WEEK_PATH =
  'planning/{language}/api/my-week/{day}';
export const ADD_RECIPES_TO_CALENDAR_PATH = 'planning/{language}/api/my-day';
export const REMOVE_RECIPE_FROM_CALENDAR_PATH =
  'planning/{language}/api/my-day/{day}/recipes/{recipe}';

export const CUSTOM_RECIPES_PATH = 'created-recipes/{language}';
export const CUSTOM_RECIPE_PATH = 'created-recipes/{language}/{id}';
export const ADD_CUSTOM_RECIPE_PATH = 'created-recipes/{language}';
export const REMOVE_CUSTOM_RECIPE_PATH = 'created-recipes/{language}/{id}';

export const MANAGED_COLLECTIONS_PATH = 'organize/{language}/api/managed-list';
export const ADD_MANAGED_COLLECTION_PATH =
  'organize/{language}/api/managed-list';
export const REMOVE_MANAGED_COLLECTION_PATH =
  'organize/{language}/api/managed-list/{id}';

export const CUSTOM_COLLECTIONS_PATH = 'organize/{language}/api/custom-list';
export const ADD_CUSTOM_COLLECTION_PATH = 'organize/{language}/api/custom-list';
export const REMOVE_CUSTOM_COLLECTION_PATH =
  'organize/{language}/api/custom-list/{id}';
export const ADD_RECIPES_TO_CUSTOM_COLLECTION_PATH =
  'organize/{language}/api/custom-list/{id}';
export const REMOVE_RECIPE_FROM_CUSTOM_COLLECTION_PATH =
  'organize/{language}/api/custom-list/{id}/recipes/{recipe}';

/** Authentication cookies the OAuth2 flow must set for a session to be valid. */
export const REQUIRED_AUTH_COOKIES = ['_oauth2_proxy', 'v-authenticated'];

/** Image transformation placeholders used by Cookidoo asset URLs. */
export const THUMBNAIL_TRANSFORMATION = 't_web_shared_recipe_221x240';
export const IMAGE_TRANSFORMATION = 't_web_rdp_recipe_584x480_1_5x';
