import { CookidooLocalization } from '@core/config/cookidoo.config';
import {
  CookidooSubscription,
  CookidooUserInfo,
} from '../../domain/types/cookidoo-account.type';
import {
  CookidooIngredient,
  CookidooRecipeDetails,
  CookidooSearchRecipeHit,
  CookidooSearchResult,
  CookidooShoppingRecipe,
} from '../../domain/types/cookidoo-recipe.type';
import {
  CookidooAdditionalItem,
  CookidooIngredientItem,
} from '../../domain/types/cookidoo-shopping-list.type';
import {
  CookidooCalendarDay,
  CookidooCalendarDayRecipe,
} from '../../domain/types/cookidoo-calendar.type';
import { CookidooCustomRecipe } from '../../domain/types/cookidoo-custom-recipe.type';
import {
  CookidooChapter,
  CookidooCollection,
} from '../../domain/types/cookidoo-collection.type';
import {
  IMAGE_TRANSFORMATION,
  THUMBNAIL_TRANSFORMATION,
} from './cookidoo.constants';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Json = Record<string, any>;

/** Build a recipe URL on the localized Cookidoo domain. */
export function constructRecipeUrl(
  localization: CookidooLocalization,
  recipeId: string,
  pathPrefix = 'recipes/recipe',
): string {
  const host = new URL(localization.url).host;
  return `https://${host}/${pathPrefix}/${localization.language}/${recipeId}`;
}

/** Replace the `{transformation}` placeholder to get (thumbnail, image) URLs. */
export function processImageUrl(url: string): [string, string] {
  return [
    url.replace('{transformation}', THUMBNAIL_TRANSFORMATION),
    url.replace('{transformation}', IMAGE_TRANSFORMATION),
  ];
}

/** Pick the first usable variant from a list of descriptive assets. */
function extractImages(
  descriptiveAssets: Json[] | undefined,
): [string | null, string | null] {
  if (!Array.isArray(descriptiveAssets)) {
    return [null, null];
  }
  for (const asset of descriptiveAssets) {
    for (const variant of ['square', 'portrait', 'landscape']) {
      const url = asset?.[variant];
      if (url) {
        return processImageUrl(String(url));
      }
    }
  }
  return [null, null];
}

/** Render a quantity object (single value or a from/to range) as text. */
function quantityToString(quantity: Json | undefined | null): string {
  if (!quantity) {
    return '';
  }
  if (quantity.value) {
    return String(quantity.value);
  }
  if (quantity.from && quantity.to) {
    return `${quantity.from} - ${quantity.to}`;
  }
  return '';
}

function ingredientDescription(item: Json): string {
  const quantity = quantityToString(item.quantity);
  if (item.unitNotation && quantity) {
    return `${quantity} ${item.unitNotation}`;
  }
  return quantity;
}

export function ingredientFromJson(item: Json): CookidooIngredient {
  return {
    id: item.localId ?? item.id,
    name: item.ingredientNotation,
    description: ingredientDescription(item),
  };
}

export function ingredientItemFromJson(item: Json): CookidooIngredientItem {
  return {
    id: item.id,
    name: item.ingredientNotation,
    isOwned: Boolean(item.isOwned),
    description: ingredientDescription(item),
  };
}

export function additionalItemFromJson(item: Json): CookidooAdditionalItem {
  return {
    id: item.id,
    name: item.name,
    isOwned: Boolean(item.isOwned),
  };
}

export function userInfoFromJson(profile: Json): CookidooUserInfo {
  const userInfo: Json = profile.userInfo ?? {};
  return {
    id: profile.id,
    username: userInfo.username,
    description: userInfo.description ?? null,
    picture: userInfo.picture ?? null,
  };
}

export function subscriptionFromJson(sub: Json): CookidooSubscription {
  return {
    active: Boolean(sub.active),
    expires: sub.expires,
    startDate: sub.startDate,
    status: sub.status,
    subscriptionLevel: sub.subscriptionLevel,
    subscriptionSource: sub.subscriptionSource,
    type: sub.type,
    extendedType: sub.extendedType,
  };
}

export function shoppingRecipeFromJson(
  recipe: Json,
  localization: CookidooLocalization,
): CookidooShoppingRecipe {
  const [thumbnail, image] = extractImages(recipe.descriptiveAssets);
  const groups: Json[] = recipe.recipeIngredientGroups ?? [];
  return {
    id: recipe.id,
    name: recipe.title,
    ingredients: groups.map(ingredientFromJson),
    thumbnail,
    image,
    url: constructRecipeUrl(localization, recipe.id),
  };
}

function findTime(times: Json[] | undefined, type: string): number | null {
  if (!Array.isArray(times)) {
    return null;
  }
  for (const entry of times) {
    if (entry?.type === type && entry?.quantity?.value) {
      return Number(entry.quantity.value);
    }
  }
  return null;
}

export function recipeDetailsFromJson(
  recipe: Json,
  localization: CookidooLocalization,
): CookidooRecipeDetails {
  const [thumbnail, image] = extractImages(recipe.descriptiveAssets);
  const groups: Json[] = recipe.recipeIngredientGroups ?? [];
  const ingredients = groups.flatMap((group) =>
    (group.recipeIngredients ?? []).map(ingredientFromJson),
  );
  const notes = (recipe.additionalInformation ?? [])
    .map((info: Json) => info.content)
    .filter(
      (content: unknown): content is string => typeof content === 'string',
    );
  const utensils = (recipe.recipeUtensils ?? [])
    .map((utensil: Json) => utensil.utensilNotation)
    .filter((value: unknown): value is string => typeof value === 'string');

  return {
    id: recipe.id,
    name: recipe.title,
    ingredients,
    difficulty: recipe.difficulty ?? null,
    notes,
    utensils,
    servingSize: recipe.servingSize?.quantity?.value ?? 0,
    activeTime: findTime(recipe.times, 'activeTime'),
    totalTime: findTime(recipe.times, 'totalTime'),
    thumbnail,
    image,
    url: constructRecipeUrl(localization, recipe.id),
  };
}

/** Map a single recipe planned on a calendar day. */
export function calendarDayRecipeFromJson(
  recipe: Json,
  localization: CookidooLocalization,
): CookidooCalendarDayRecipe {
  const images = recipe.assets?.images;
  const [thumbnail, image] = extractImages(images ? [images] : undefined);
  const totalTime =
    recipe.totalTime === undefined || recipe.totalTime === null
      ? null
      : Number(recipe.totalTime);
  return {
    id: recipe.id,
    name: recipe.title,
    totalTime,
    thumbnail,
    image,
    url: constructRecipeUrl(localization, recipe.id),
  };
}

/** Map a single day of the meal-planner calendar, merging custom recipes. */
export function calendarDayFromJson(
  day: Json,
  localization: CookidooLocalization,
): CookidooCalendarDay {
  const recipes: Json[] = day.recipes ?? [];
  const customerRecipes: Json[] = day.customerRecipes ?? [];
  return {
    id: day.id,
    title: day.title,
    recipes: [...recipes, ...customerRecipes].map((recipe) =>
      calendarDayRecipeFromJson(recipe, localization),
    ),
    customerRecipeIds: Array.isArray(day.customerRecipeIds)
      ? day.customerRecipeIds
      : [],
  };
}

/**
 * Convert a duration to whole seconds. Accepts a number (already seconds) or an
 * ISO-8601 duration string such as `PT1H30M`; anything else yields 0.
 */
export function durationToSeconds(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return Math.trunc(value);
  }
  if (typeof value !== 'string') {
    return 0;
  }
  const match =
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(
      value.trim(),
    );
  if (!match) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.trunc(numeric) : 0;
  }
  const [, days, hours, minutes, seconds] = match;
  return Math.trunc(
    (Number(days ?? 0) * 24 + Number(hours ?? 0)) * 3600 +
      Number(minutes ?? 0) * 60 +
      Number(seconds ?? 0),
  );
}

/** Normalise a recipe-content list whose entries may be strings or `{text}`. */
function extractTextList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) =>
      typeof item === 'string' ? item : ((item as Json)?.text ?? null),
    )
    .filter((text): text is string => typeof text === 'string');
}

export function customRecipeFromJson(
  recipe: Json,
  localization: CookidooLocalization,
): CookidooCustomRecipe {
  const content: Json = recipe.recipeContent ?? {};
  let thumbnail: string | null = null;
  let image: string | null = null;
  if (content.image) {
    [thumbnail, image] = processImageUrl(String(content.image));
  }
  const recipeYield: Json = content.recipeYield ??
    content.yield ?? { value: 0, unitText: '' };

  return {
    id: recipe.recipeId,
    name: content.name,
    ingredients: extractTextList(
      content.recipeIngredient ?? content.ingredients,
    ),
    instructions: extractTextList(
      content.recipeInstructions ?? content.instructions,
    ),
    servingSize: recipeYield.value ?? 0,
    totalTime: durationToSeconds(content.totalTime),
    activeTime: durationToSeconds(content.prepTime),
    tools: extractTextList(content.tool ?? content.tools),
    thumbnail,
    image,
    url: constructRecipeUrl(localization, recipe.recipeId, 'created-recipes'),
  };
}

export function collectionFromJson(
  collection: Json,
  localization: CookidooLocalization,
): CookidooCollection {
  const chapters: Json[] = collection.chapters ?? [];
  return {
    id: collection.id,
    name: collection.title,
    description: collection.description ?? null,
    chapters: chapters.map(
      (chapter): CookidooChapter => ({
        name: chapter.title,
        recipes: (chapter.recipes ?? []).map((recipe: Json) => ({
          id: recipe.id,
          name: recipe.title,
          totalTime: Math.trunc(Number(recipe.totalTime ?? 0)),
          url: constructRecipeUrl(localization, recipe.id),
        })),
      }),
    ),
  };
}

export function searchResultFromJson(
  data: Json,
  localization: CookidooLocalization,
): CookidooSearchResult {
  const rawRecipes: Json[] = data.data ?? data.recipes ?? [];
  const recipes: CookidooSearchRecipeHit[] = [];
  for (const item of rawRecipes) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const id = item.id ?? '';
    const [thumbnail, image] = extractImages(item.descriptiveAssets);
    recipes.push({
      id,
      name: item.title ?? item.name ?? '',
      thumbnail,
      image,
      url: constructRecipeUrl(localization, id),
    });
  }
  const total = typeof data.total === 'number' ? data.total : recipes.length;
  return { recipes, total };
}
