import { z } from 'zod';

/** Input schema for the paginated collection listing tools. */
export const collectionPageSchema = {
  page: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('Zero-based page number (defaults to 0)'),
};

/** Input schema for tools that take a managed-collection id. */
export const managedCollectionIdSchema = {
  collectionId: z.string().min(1).describe('Id of the managed collection'),
};

/** Input schema for the `cookidoo_add_custom_collection` MCP tool. */
export const customCollectionNameSchema = {
  name: z.string().min(1).describe('Name/title of the new custom collection'),
};

/** Input schema for tools that take a custom-collection id. */
export const customCollectionIdSchema = {
  collectionId: z.string().min(1).describe('Id of the custom collection'),
};

/** Input schema for adding recipes to a custom collection. */
export const customCollectionAddRecipesSchema = {
  collectionId: z.string().min(1).describe('Id of the custom collection'),
  recipeIds: z
    .array(z.string().min(1))
    .min(1)
    .describe('Ids of the recipes to add to the collection'),
};

/** Input schema for removing a recipe from a custom collection. */
export const customCollectionRemoveRecipeSchema = {
  collectionId: z.string().min(1).describe('Id of the custom collection'),
  recipeId: z.string().min(1).describe('Id of the recipe to remove'),
};
