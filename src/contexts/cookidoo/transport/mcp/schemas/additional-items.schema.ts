import { z } from 'zod';

/** Input schema for the `cookidoo_add_additional_items` MCP tool. */
export const addAdditionalItemsSchema = {
  names: z
    .array(z.string().min(1))
    .min(1)
    .describe('Free-text item labels to add, e.g. ["milk", "olive oil"]'),
};

/** Input schema for the `cookidoo_remove_additional_items` MCP tool. */
export const removeAdditionalItemsSchema = {
  ids: z
    .array(z.string().min(1))
    .min(1)
    .describe('Ids of the additional items to remove from the shopping list'),
};
