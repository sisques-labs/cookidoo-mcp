import { z } from 'zod';

/** Input schema for the `cookidoo_search_recipes` MCP tool. */
export const recipeSearchSchema = {
  query: z
    .string()
    .min(1)
    .optional()
    .describe('Free-text search query, e.g. "chicken curry"'),
  ingredients: z
    .array(z.string())
    .optional()
    .describe('Only include recipes containing all of these ingredients'),
  excludeIngredients: z
    .array(z.string())
    .optional()
    .describe('Exclude recipes containing any of these ingredients'),
  categories: z
    .array(z.string())
    .optional()
    .describe('Filter by category ids'),
  tags: z.array(z.string()).optional().describe('Filter by tags'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .optional()
    .describe('Filter by difficulty level'),
  preparationTime: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum preparation (active) time, in seconds'),
  totalTime: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Maximum total time, in seconds'),
  portions: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Number of portions'),
  page: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('Result page number (API-dependent, often 0-based)'),
  pageSize: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('Number of results per page'),
  tmv: z
    .array(z.enum(['TM5', 'TM6', 'TM7', 'TM31']))
    .optional()
    .describe('Filter by supported Thermomix machine versions'),
};
