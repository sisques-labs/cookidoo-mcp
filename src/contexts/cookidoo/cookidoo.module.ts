import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { COOKIDOO_CLIENT } from './domain/interfaces/cookidoo-client.interface';
import { CookidooHttpClient } from './infrastructure/cookidoo/cookidoo-http.client';
import { AccountFindUserInfoQueryHandler } from './application/queries/account-find-user-info/account-find-user-info.handler';
import { SubscriptionFindActiveQueryHandler } from './application/queries/subscription-find-active/subscription-find-active.handler';
import { RecipeFindDetailsQueryHandler } from './application/queries/recipe-find-details/recipe-find-details.handler';
import { RecipeSearchQueryHandler } from './application/queries/recipe-search/recipe-search.handler';
import { ShoppingListFindRecipesQueryHandler } from './application/queries/shopping-list-find-recipes/shopping-list-find-recipes.handler';
import { ShoppingListFindIngredientItemsQueryHandler } from './application/queries/shopping-list-find-ingredient-items/shopping-list-find-ingredient-items.handler';
import { ShoppingListFindAdditionalItemsQueryHandler } from './application/queries/shopping-list-find-additional-items/shopping-list-find-additional-items.handler';
import { ShoppingListAddRecipeIngredientsCommandHandler } from './application/commands/shopping-list-add-recipe-ingredients/shopping-list-add-recipe-ingredients.handler';
import { ShoppingListRemoveRecipeIngredientsCommandHandler } from './application/commands/shopping-list-remove-recipe-ingredients/shopping-list-remove-recipe-ingredients.handler';
import { ShoppingListAddAdditionalItemsCommandHandler } from './application/commands/shopping-list-add-additional-items/shopping-list-add-additional-items.handler';
import { ShoppingListRemoveAdditionalItemsCommandHandler } from './application/commands/shopping-list-remove-additional-items/shopping-list-remove-additional-items.handler';
import { ShoppingListClearCommandHandler } from './application/commands/shopping-list-clear/shopping-list-clear.handler';
import { CalendarFindWeekRecipesQueryHandler } from './application/queries/calendar-find-week-recipes/calendar-find-week-recipes.handler';
import { CalendarAddRecipesCommandHandler } from './application/commands/calendar-add-recipes/calendar-add-recipes.handler';
import { CalendarRemoveRecipeCommandHandler } from './application/commands/calendar-remove-recipe/calendar-remove-recipe.handler';
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

const QUERY_HANDLERS = [
  AccountFindUserInfoQueryHandler,
  SubscriptionFindActiveQueryHandler,
  RecipeFindDetailsQueryHandler,
  RecipeSearchQueryHandler,
  ShoppingListFindRecipesQueryHandler,
  ShoppingListFindIngredientItemsQueryHandler,
  ShoppingListFindAdditionalItemsQueryHandler,
  CalendarFindWeekRecipesQueryHandler,
];

const COMMAND_HANDLERS = [
  ShoppingListAddRecipeIngredientsCommandHandler,
  ShoppingListRemoveRecipeIngredientsCommandHandler,
  ShoppingListAddAdditionalItemsCommandHandler,
  ShoppingListRemoveAdditionalItemsCommandHandler,
  ShoppingListClearCommandHandler,
  CalendarAddRecipesCommandHandler,
  CalendarRemoveRecipeCommandHandler,
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
