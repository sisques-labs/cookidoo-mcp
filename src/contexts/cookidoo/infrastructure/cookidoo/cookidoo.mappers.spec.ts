import { CookidooLocalization } from '@core/config/cookidoo.config';
import {
  additionalItemFromJson,
  constructRecipeUrl,
  ingredientItemFromJson,
  recipeDetailsFromJson,
  searchResultFromJson,
  shoppingRecipeFromJson,
  subscriptionFromJson,
  userInfoFromJson,
} from './cookidoo.mappers';

const localization: CookidooLocalization = {
  countryCode: 'ch',
  language: 'de-CH',
  url: 'https://cookidoo.ch/foundation/de-CH',
};

describe('cookidoo mappers', () => {
  describe('constructRecipeUrl', () => {
    it('builds a localized recipe URL on the cookidoo domain', () => {
      expect(constructRecipeUrl(localization, 'r123')).toBe(
        'https://cookidoo.ch/recipes/recipe/de-CH/r123',
      );
    });
  });

  describe('userInfoFromJson', () => {
    it('maps the community profile, defaulting missing fields to null', () => {
      const result = userInfoFromJson({
        id: 'u1',
        userInfo: { username: 'chef', picture: 'http://img' },
      });

      expect(result).toEqual({
        id: 'u1',
        username: 'chef',
        description: null,
        picture: 'http://img',
      });
    });
  });

  describe('subscriptionFromJson', () => {
    it('maps the API field names to the domain shape', () => {
      const result = subscriptionFromJson({
        active: true,
        expires: '2027-01-01',
        startDate: '2026-01-01',
        status: 'ACTIVE',
        subscriptionLevel: 'PREMIUM',
        subscriptionSource: 'WEB',
        type: 'PAID',
        extendedType: 'PAID_EXTENDED',
      });

      expect(result.active).toBe(true);
      expect(result.startDate).toBe('2026-01-01');
      expect(result.subscriptionLevel).toBe('PREMIUM');
    });
  });

  describe('ingredientItemFromJson', () => {
    it('builds a "quantity unit" description', () => {
      const result = ingredientItemFromJson({
        id: 'i1',
        ingredientNotation: 'flour',
        isOwned: false,
        quantity: { value: 200 },
        unitNotation: 'g',
      });

      expect(result).toEqual({
        id: 'i1',
        name: 'flour',
        isOwned: false,
        description: '200 g',
      });
    });

    it('renders a from/to range when there is no single value', () => {
      const result = ingredientItemFromJson({
        id: 'i2',
        ingredientNotation: 'water',
        isOwned: true,
        quantity: { from: 1, to: 2 },
        unitNotation: 'l',
      });

      expect(result.description).toBe('1 - 2 l');
      expect(result.isOwned).toBe(true);
    });
  });

  describe('additionalItemFromJson', () => {
    it('maps id, name and owned flag', () => {
      expect(
        additionalItemFromJson({ id: 'a1', name: 'milk', isOwned: true }),
      ).toEqual({ id: 'a1', name: 'milk', isOwned: true });
    });
  });

  describe('shoppingRecipeFromJson', () => {
    it('maps ingredients and image variants', () => {
      const result = shoppingRecipeFromJson(
        {
          id: 'r1',
          title: 'Soup',
          recipeIngredientGroups: [
            {
              id: 'i1',
              ingredientNotation: 'carrot',
              quantity: { value: 3 },
              unitNotation: '',
            },
          ],
          descriptiveAssets: [{ square: 'http://img/{transformation}.jpg' }],
        },
        localization,
      );

      expect(result.id).toBe('r1');
      expect(result.name).toBe('Soup');
      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0].description).toBe('3');
      expect(result.thumbnail).toContain('t_web_shared_recipe_221x240');
      expect(result.image).toContain('t_web_rdp_recipe_584x480_1_5x');
      expect(result.url).toBe('https://cookidoo.ch/recipes/recipe/de-CH/r1');
    });
  });

  describe('recipeDetailsFromJson', () => {
    it('flattens ingredient groups and extracts times/notes/utensils', () => {
      const result = recipeDetailsFromJson(
        {
          id: 'r2',
          title: 'Cake',
          difficulty: 'easy',
          recipeIngredientGroups: [
            {
              recipeIngredients: [
                {
                  id: 'i1',
                  ingredientNotation: 'sugar',
                  quantity: { value: 100 },
                  unitNotation: 'g',
                },
              ],
            },
          ],
          additionalInformation: [{ content: 'Preheat oven' }],
          recipeUtensils: [{ utensilNotation: 'bowl' }],
          servingSize: { quantity: { value: 8 } },
          times: [
            { type: 'activeTime', quantity: { value: 600 } },
            { type: 'totalTime', quantity: { value: 3600 } },
          ],
        },
        localization,
      );

      expect(result.ingredients).toHaveLength(1);
      expect(result.difficulty).toBe('easy');
      expect(result.notes).toEqual(['Preheat oven']);
      expect(result.utensils).toEqual(['bowl']);
      expect(result.servingSize).toBe(8);
      expect(result.activeTime).toBe(600);
      expect(result.totalTime).toBe(3600);
    });

    it('falls back to null times when not present', () => {
      const result = recipeDetailsFromJson(
        { id: 'r3', title: 'Quick', recipeIngredientGroups: [] },
        localization,
      );

      expect(result.activeTime).toBeNull();
      expect(result.totalTime).toBeNull();
      expect(result.servingSize).toBe(0);
    });
  });

  describe('searchResultFromJson', () => {
    it('reads recipes from the `data` key and reports the total', () => {
      const result = searchResultFromJson(
        {
          data: [
            { id: 'r1', title: 'A' },
            { id: 'r2', name: 'B' },
          ],
          total: 42,
        },
        localization,
      );

      expect(result.total).toBe(42);
      expect(result.recipes.map((r) => r.name)).toEqual(['A', 'B']);
      expect(result.recipes[0].url).toBe(
        'https://cookidoo.ch/recipes/recipe/de-CH/r1',
      );
    });

    it('defaults total to the number of hits when absent', () => {
      const result = searchResultFromJson(
        { recipes: [{ id: 'r1', title: 'A' }] },
        localization,
      );

      expect(result.total).toBe(1);
    });
  });
});
