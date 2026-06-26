import { z } from 'zod';

/** Input schema for tools that take a single custom-recipe id. */
export const customRecipeIdSchema = {
  id: z.string().min(1).describe('Id of the custom (user-created) recipe'),
};

/** Input schema for the `cookidoo_add_custom_recipe` MCP tool. */
export const customRecipeAddSchema = {
  recipeId: z
    .string()
    .min(1)
    .describe('Id of the existing recipe to base the custom recipe on'),
  servingSize: z
    .number()
    .int()
    .positive()
    .describe('Serving size (portions) for the new custom recipe'),
};
