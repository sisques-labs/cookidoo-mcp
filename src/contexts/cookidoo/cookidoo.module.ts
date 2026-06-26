import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { COOKIDOO_CLIENT } from './domain/interfaces/cookidoo-client.interface';
import { CookidooHttpClient } from './infrastructure/cookidoo/cookidoo-http.client';

// Query handlers
import { AccountFindUserInfoQueryHandler } from './application/queries/account-find-user-info/account-find-user-info.handler';
import { SubscriptionFindActiveQueryHandler } from './application/queries/subscription-find-active/subscription-find-active.handler';
import { RecipeFindDetailsQueryHandler } from './application/queries/recipe-find-details/recipe-find-details.handler';
import { RecipeSearchQueryHandler } from './application/queries/recipe-search/recipe-search.handler';
import { ShoppingListFindRecipesQueryHandler } from './application/queries/shopping-list-find-recipes/shopping-list-find-recipes.handler';
import { ShoppingListFindIngredientItemsQueryHandler } from './application/queries/shopping-list-find-ingredient-items/shopping-list-find-ingredient-items.handler';
import { ShoppingListFindAdditionalItemsQueryHandler } from './application/queries/shopping-list-find-additional-items/shopping-list-find-additional-items.handler';
import { CalendarFindWeekRecipesQueryHandler } from './application/queries/calendar-find-week-recipes/calendar-find-week-recipes.handler';
import { CustomRecipeFindAllQueryHandler } from './application/queries/custom-recipe-find-all/custom-recipe-find-all.handler';
import { CustomRecipeFindDetailsQueryHandler } from './application/queries/custom-recipe-find-details/custom-recipe-find-details.handler';
import { ManagedCollectionCountQueryHandler } from './application/queries/managed-collection-count/managed-collection-count.handler';
import { ManagedCollectionFindAllQueryHandler } from './application/queries/managed-collection-find-all/managed-collection-find-all.handler';
import { CustomCollectionCountQueryHandler } from './application/queries/custom-collection-count/custom-collection-count.handler';
import { CustomCollectionFindAllQueryHandler } from './application/queries/custom-collection-find-all/custom-collection-find-all.handler';

// Command handlers
import { ShoppingListAddRecipeIngredientsCommandHandler } from './application/commands/shopping-list-add-recipe-ingredients/shopping-list-add-recipe-ingredients.handler';
import { ShoppingListRemoveRecipeIngredientsCommandHandler } from './application/commands/shopping-list-remove-recipe-ingredients/shopping-list-remove-recipe-ingredients.handler';
import { ShoppingListAddAdditionalItemsCommandHandler } from './application/commands/shopping-list-add-additional-items/shopping-list-add-additional-items.handler';
import { ShoppingListRemoveAdditionalItemsCommandHandler } from './application/commands/shopping-list-remove-additional-items/shopping-list-remove-additional-items.handler';
import { ShoppingListClearCommandHandler } from './application/commands/shopping-list-clear/shopping-list-clear.handler';
import { CalendarAddRecipesCommandHandler } from './application/commands/calendar-add-recipes/calendar-add-recipes.handler';
import { CalendarRemoveRecipeCommandHandler } from './application/commands/calendar-remove-recipe/calendar-remove-recipe.handler';
import { CustomRecipeAddCommandHandler } from './application/commands/custom-recipe-add/custom-recipe-add.handler';
import { CustomRecipeRemoveCommandHandler } from './application/commands/custom-recipe-remove/custom-recipe-remove.handler';
import { ShoppingListMarkIngredientItemsCommandHandler } from './application/commands/shopping-list-mark-ingredient-items/shopping-list-mark-ingredient-items.handler';
import { ShoppingListEditAdditionalItemsCommandHandler } from './application/commands/shopping-list-edit-additional-items/shopping-list-edit-additional-items.handler';
import { ShoppingListMarkAdditionalItemsCommandHandler } from './application/commands/shopping-list-mark-additional-items/shopping-list-mark-additional-items.handler';
import { ShoppingListAddCustomRecipeIngredientsCommandHandler } from './application/commands/shopping-list-add-custom-recipe-ingredients/shopping-list-add-custom-recipe-ingredients.handler';
import { ShoppingListRemoveCustomRecipeIngredientsCommandHandler } from './application/commands/shopping-list-remove-custom-recipe-ingredients/shopping-list-remove-custom-recipe-ingredients.handler';
import { CalendarAddCustomRecipesCommandHandler } from './application/commands/calendar-add-custom-recipes/calendar-add-custom-recipes.handler';
import { CalendarRemoveCustomRecipeCommandHandler } from './application/commands/calendar-remove-custom-recipe/calendar-remove-custom-recipe.handler';
import { ManagedCollectionAddCommandHandler } from './application/commands/managed-collection-add/managed-collection-add.handler';
import { ManagedCollectionRemoveCommandHandler } from './application/commands/managed-collection-remove/managed-collection-remove.handler';
import { CustomCollectionAddCommandHandler } from './application/commands/custom-collection-add/custom-collection-add.handler';
import { CustomCollectionRemoveCommandHandler } from './application/commands/custom-collection-remove/custom-collection-remove.handler';
import { CustomCollectionAddRecipesCommandHandler } from './application/commands/custom-collection-add-recipes/custom-collection-add-recipes.handler';
import { CustomCollectionRemoveRecipeCommandHandler } from './application/commands/custom-collection-remove-recipe/custom-collection-remove-recipe.handler';

// MCP tools
import { AccountGetUserInfoMcpTool } from './transport/mcp/tools/account-get-user-info.tool';
import { SubscriptionGetActiveMcpTool } from './transport/mcp/tools/subscription-get-active.tool';
import { RecipeSearchMcpTool } from './transport/mcp/tools/recipe-search.tool';
import { RecipeGetDetailsMcpTool } from './transport/mcp/tools/recipe-get-details.tool';
import { ShoppingListGetRecipesMcpTool } from './transport/mcp/tools/shopping-list-get-recipes.tool';
import { ShoppingListGetIngredientItemsMcpTool } from './transport/mcp/tools/shopping-list-get-ingredient-items.tool';
import { ShoppingListGetAdditionalItemsMcpTool } from './transport/mcp/tools/shopping-list-get-additional-items.tool';
import { ShoppingListAddRecipeIngredientsMcpTool } from './transport/mcp/tools/shopping-list-add-recipe-ingredients.tool';
import { ShoppingListRemoveRecipeIngredientsMcpTool } from './transport/mcp/tools/shopping-list-remove-recipe-ingredients.tool';
import { ShoppingListAddAdditionalItemsMcpTool } from './transport/mcp/tools/shopping-list-add-additional-items.tool';
import { ShoppingListRemoveAdditionalItemsMcpTool } from './transport/mcp/tools/shopping-list-remove-additional-items.tool';
import { ShoppingListClearMcpTool } from './transport/mcp/tools/shopping-list-clear.tool';
import { CalendarGetWeekMcpTool } from './transport/mcp/tools/calendar-get-week.tool';
import { CalendarAddRecipesMcpTool } from './transport/mcp/tools/calendar-add-recipes.tool';
import { CalendarRemoveRecipeMcpTool } from './transport/mcp/tools/calendar-remove-recipe.tool';
import { CustomRecipeListMcpTool } from './transport/mcp/tools/custom-recipe-list.tool';
import { CustomRecipeGetDetailsMcpTool } from './transport/mcp/tools/custom-recipe-get-details.tool';
import { CustomRecipeAddMcpTool } from './transport/mcp/tools/custom-recipe-add.tool';
import { CustomRecipeRemoveMcpTool } from './transport/mcp/tools/custom-recipe-remove.tool';
import { ShoppingListMarkIngredientItemsMcpTool } from './transport/mcp/tools/shopping-list-mark-ingredient-items.tool';
import { ShoppingListMarkAdditionalItemsMcpTool } from './transport/mcp/tools/shopping-list-mark-additional-items.tool';
import { ShoppingListEditAdditionalItemsMcpTool } from './transport/mcp/tools/shopping-list-edit-additional-items.tool';
import { ShoppingListAddCustomRecipeIngredientsMcpTool } from './transport/mcp/tools/shopping-list-add-custom-recipe-ingredients.tool';
import { ShoppingListRemoveCustomRecipeIngredientsMcpTool } from './transport/mcp/tools/shopping-list-remove-custom-recipe-ingredients.tool';
import { CalendarAddCustomRecipesMcpTool } from './transport/mcp/tools/calendar-add-custom-recipes.tool';
import { CalendarRemoveCustomRecipeMcpTool } from './transport/mcp/tools/calendar-remove-custom-recipe.tool';
import { ManagedCollectionCountMcpTool } from './transport/mcp/tools/managed-collection-count.tool';
import { ManagedCollectionListMcpTool } from './transport/mcp/tools/managed-collection-list.tool';
import { ManagedCollectionAddMcpTool } from './transport/mcp/tools/managed-collection-add.tool';
import { ManagedCollectionRemoveMcpTool } from './transport/mcp/tools/managed-collection-remove.tool';
import { CustomCollectionCountMcpTool } from './transport/mcp/tools/custom-collection-count.tool';
import { CustomCollectionListMcpTool } from './transport/mcp/tools/custom-collection-list.tool';
import { CustomCollectionAddMcpTool } from './transport/mcp/tools/custom-collection-add.tool';
import { CustomCollectionRemoveMcpTool } from './transport/mcp/tools/custom-collection-remove.tool';
import { CustomCollectionAddRecipesMcpTool } from './transport/mcp/tools/custom-collection-add-recipes.tool';
import { CustomCollectionRemoveRecipeMcpTool } from './transport/mcp/tools/custom-collection-remove-recipe.tool';

const QUERY_HANDLERS = [
  AccountFindUserInfoQueryHandler,
  SubscriptionFindActiveQueryHandler,
  RecipeFindDetailsQueryHandler,
  RecipeSearchQueryHandler,
  ShoppingListFindRecipesQueryHandler,
  ShoppingListFindIngredientItemsQueryHandler,
  ShoppingListFindAdditionalItemsQueryHandler,
  CalendarFindWeekRecipesQueryHandler,
  CustomRecipeFindAllQueryHandler,
  CustomRecipeFindDetailsQueryHandler,
  ManagedCollectionCountQueryHandler,
  ManagedCollectionFindAllQueryHandler,
  CustomCollectionCountQueryHandler,
  CustomCollectionFindAllQueryHandler,
];

const COMMAND_HANDLERS = [
  ShoppingListAddRecipeIngredientsCommandHandler,
  ShoppingListRemoveRecipeIngredientsCommandHandler,
  ShoppingListAddAdditionalItemsCommandHandler,
  ShoppingListRemoveAdditionalItemsCommandHandler,
  ShoppingListClearCommandHandler,
  CalendarAddRecipesCommandHandler,
  CalendarRemoveRecipeCommandHandler,
  CustomRecipeAddCommandHandler,
  CustomRecipeRemoveCommandHandler,
  ShoppingListMarkIngredientItemsCommandHandler,
  ShoppingListEditAdditionalItemsCommandHandler,
  ShoppingListMarkAdditionalItemsCommandHandler,
  ShoppingListAddCustomRecipeIngredientsCommandHandler,
  ShoppingListRemoveCustomRecipeIngredientsCommandHandler,
  CalendarAddCustomRecipesCommandHandler,
  CalendarRemoveCustomRecipeCommandHandler,
  ManagedCollectionAddCommandHandler,
  ManagedCollectionRemoveCommandHandler,
  CustomCollectionAddCommandHandler,
  CustomCollectionRemoveCommandHandler,
  CustomCollectionAddRecipesCommandHandler,
  CustomCollectionRemoveRecipeCommandHandler,
];

const INFRASTRUCTURE = [
  { provide: COOKIDOO_CLIENT, useClass: CookidooHttpClient },
];

const MCP_TOOLS = [
  AccountGetUserInfoMcpTool,
  SubscriptionGetActiveMcpTool,
  RecipeSearchMcpTool,
  RecipeGetDetailsMcpTool,
  ShoppingListGetRecipesMcpTool,
  ShoppingListGetIngredientItemsMcpTool,
  ShoppingListGetAdditionalItemsMcpTool,
  ShoppingListAddRecipeIngredientsMcpTool,
  ShoppingListRemoveRecipeIngredientsMcpTool,
  ShoppingListAddAdditionalItemsMcpTool,
  ShoppingListRemoveAdditionalItemsMcpTool,
  ShoppingListClearMcpTool,
  CalendarGetWeekMcpTool,
  CalendarAddRecipesMcpTool,
  CalendarRemoveRecipeMcpTool,
  CustomRecipeListMcpTool,
  CustomRecipeGetDetailsMcpTool,
  CustomRecipeAddMcpTool,
  CustomRecipeRemoveMcpTool,
  ShoppingListMarkIngredientItemsMcpTool,
  ShoppingListMarkAdditionalItemsMcpTool,
  ShoppingListEditAdditionalItemsMcpTool,
  ShoppingListAddCustomRecipeIngredientsMcpTool,
  ShoppingListRemoveCustomRecipeIngredientsMcpTool,
  CalendarAddCustomRecipesMcpTool,
  CalendarRemoveCustomRecipeMcpTool,
  ManagedCollectionCountMcpTool,
  ManagedCollectionListMcpTool,
  ManagedCollectionAddMcpTool,
  ManagedCollectionRemoveMcpTool,
  CustomCollectionCountMcpTool,
  CustomCollectionListMcpTool,
  CustomCollectionAddMcpTool,
  CustomCollectionRemoveMcpTool,
  CustomCollectionAddRecipesMcpTool,
  CustomCollectionRemoveRecipeMcpTool,
];

@Module({
  imports: [CqrsModule],
  providers: [
    ...QUERY_HANDLERS,
    ...COMMAND_HANDLERS,
    ...INFRASTRUCTURE,
    ...MCP_TOOLS,
  ],
})
export class CookidooModule {}
