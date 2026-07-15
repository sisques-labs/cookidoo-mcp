import { z } from 'zod';

/**
 * Input schema for the ownership ("bought") toggle tools, shared by ingredient
 * and additional items.
 */
export const ownershipChangesSchema = {
  items: z
    .array(
      z.object({
        id: z.string().min(1).describe('Id of the shopping-list item'),
        isOwned: z
          .boolean()
          .describe('true = already bought/owned, false = still needed'),
      }),
    )
    .min(1)
    .describe('Items whose owned ("bought") flag to set'),
};

/** Input schema for renaming free-text ("additional") shopping-list items. */
export const additionalItemEditsSchema = {
  items: z
    .array(
      z.object({
        id: z.string().min(1).describe('Id of the additional item'),
        name: z.string().min(1).describe('New name for the item'),
      }),
    )
    .min(1)
    .describe('Additional items to rename'),
};
