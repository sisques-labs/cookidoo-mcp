# cookidoo-mcp

An [MCP](https://modelcontextprotocol.io) server for **Cookidoo**, built with
NestJS. It exposes a Cookidoo account (recipes, shopping list, subscription) to
AI tools (Claude, IDEs, agents, …) as a set of MCP tools.

The Cookidoo client is a TypeScript rewrite of the Python
[`cookidoo-api`](https://github.com/miaucl/cookidoo-api) library. This first
migration covers the **core**: authentication, account info, recipe search &
details, and shopping-list management.

## Architecture

The project follows the same DDD + CQRS + Hexagonal layout as
[`gardenia-api`](https://github.com/sisques-labs/gardenia-api):

```
src/
  core/
    config/            env validation + Cookidoo config (env-var credentials)
    mcp/               shared MCP transport (Streamable HTTP) + tool discovery
  contexts/
    cookidoo/
      domain/          types, the ICookidooClient port, exceptions
      application/     CQRS commands & queries (dispatch to the port)
      infrastructure/  CookidooHttpClient — the TS rewrite of cookidoo-api
      transport/mcp/   MCP tools + Zod input schemas
  app.module.ts
  main.ts
```

- **Transport**: Streamable HTTP (stateless) at `POST /api/mcp`. `GET`/`DELETE`
  return `405` (no sessions). A fresh `McpServer` is built per request.
- **Tools** live in `contexts/cookidoo/transport/mcp/` and only dispatch
  Commands/Queries through the CQRS bus — never call the client directly.
- **The client** (`CookidooHttpClient`) is a singleton behind the
  `COOKIDOO_CLIENT` port. It logs in lazily via the Cookidoo OAuth2 cookie flow
  and transparently re-authenticates on a `401`.

## Configuration

Credentials and localization come from environment variables (see
[`.env.example`](.env.example)):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `COOKIDOO_EMAIL` | yes | — | Cookidoo account email |
| `COOKIDOO_PASSWORD` | yes | — | Cookidoo account password |
| `COOKIDOO_COUNTRY_CODE` | no | `ch` | Localization country code |
| `COOKIDOO_LANGUAGE` | no | `de-CH` | Localization language |
| `COOKIDOO_URL` | no | `https://cookidoo.ch/foundation/de-CH` | Localization base URL |
| `PORT` | no | `3000` | HTTP port |

## Running

```bash
pnpm install
cp .env.example .env   # then fill in your credentials
pnpm dev               # watch mode
# or
pnpm build && pnpm prod
```

The MCP endpoint is then available at `http://localhost:3000/api/mcp`.

## Tools

| Tool | Kind | Description |
|------|------|-------------|
| `cookidoo_get_user_info` | query | Account public profile |
| `cookidoo_get_active_subscription` | query | Active subscription (or null) |
| `cookidoo_search_recipes` | query | Search the recipe catalogue with filters |
| `cookidoo_get_recipe_details` | query | Full details of a recipe by id |
| `cookidoo_get_shopping_list_recipes` | query | Recipes on the shopping list |
| `cookidoo_get_ingredient_items` | query | Ingredient items on the shopping list |
| `cookidoo_get_additional_items` | query | Free-text items on the shopping list |
| `cookidoo_add_recipe_ingredients` | command | Add recipes' ingredients to the list |
| `cookidoo_remove_recipe_ingredients` | command | Remove recipes' ingredients from the list |
| `cookidoo_add_additional_items` | command | Add free-text items to the list |
| `cookidoo_remove_additional_items` | command | Remove free-text items from the list |
| `cookidoo_clear_shopping_list` | command | Empty the shopping list |

### Adding a tool

1. Add a Zod input schema under `transport/mcp/schemas/`.
2. Add a Command/Query (+ handler) under `application/` that dispatches to the
   `ICookidooClient` port; extend the port + `CookidooHttpClient` if the
   underlying Cookidoo endpoint isn't wired yet.
3. Add the tool under `transport/mcp/tools/`, tagged with `@McpTool()`, and
   register it in the `MCP_TOOLS` array of `cookidoo.module.ts`.

## Not yet migrated

The upstream library also covers custom recipes, collections (managed/custom)
and the meal-planning calendar. These are intentionally left out of this first
"core" migration and can be added following the steps above.

## License

UNLICENSED — © Sisques Labs.
