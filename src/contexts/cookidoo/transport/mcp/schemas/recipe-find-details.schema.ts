import { z } from 'zod';

/** Input schema for the `cookidoo_get_recipe_details` MCP tool. */
export const recipeFindDetailsSchema = {
  id: z.string().min(1).describe('Id of the recipe, e.g. "r907015"'),
};
