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

export const ADDITIONAL_ITEMS_PATH = 'shopping/{language}';
export const ADD_ADDITIONAL_ITEMS_PATH =
  'shopping/{language}/additional-items/add';
export const REMOVE_ADDITIONAL_ITEMS_PATH =
  'shopping/{language}/additional-items/remove';

export const COMMUNITY_PROFILE_PATH = 'community/profile';
export const SUBSCRIPTIONS_PATH = 'ownership/subscriptions';

/** Authentication cookies the OAuth2 flow must set for a session to be valid. */
export const REQUIRED_AUTH_COOKIES = ['_oauth2_proxy', 'v-authenticated'];

/** Image transformation placeholders used by Cookidoo asset URLs. */
export const THUMBNAIL_TRANSFORMATION = 't_web_shared_recipe_221x240';
export const IMAGE_TRANSFORMATION = 't_web_rdp_recipe_584x480_1_5x';
