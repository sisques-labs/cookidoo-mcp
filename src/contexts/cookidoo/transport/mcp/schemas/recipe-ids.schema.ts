import { z } from 'zod';

/**
 * Input schema shared by the add/remove recipe-ingredients shopping-list tools.
 */
export const recipeIdsSchema = {
  recipeIds: z
    .array(z.string().min(1))
    .min(1)
    .describe('Ids of the recipes whose ingredients to add/remove'),
};
