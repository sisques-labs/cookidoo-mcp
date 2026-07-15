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
| `COOKIDOO_COUNTRY_CODE` | no | `es` | Localization country code |
| `COOKIDOO_LANGUAGE` | no | `es-ES` | Localization language |
| `COOKIDOO_URL` | no | `https://cookidoo.es/foundation/es-ES` | Localization base URL |
| `COOKIDOO_COOKIE_FILE` | no | — | Path to persist the session across restarts (see below) |
| `COOKIDOO_DEBUG` | no | `false` | Set to `true` to log the full OAuth2 login flow (each redirect hop and `Set-Cookie` outcome) when debugging authentication |
| `PORT` | no | `3000` | HTTP port |

### Session persistence

By default the session lives only in memory: a fresh start logs in again. Set
`COOKIDOO_COOKIE_FILE` to a writable path and the client restores the session
from it on startup and rewrites it after every successful login, so restarts
reuse the existing session (an expired one self-heals on the next `401`). The
file holds session cookies — treat it like a credential and keep it out of
version control.

## Running

### Local (pnpm)

```bash
pnpm install
cp .env.example .env   # then fill in your credentials
pnpm dev               # watch mode
# or
pnpm build && pnpm prod
```

### Docker

```bash
docker build -t cookidoo-mcp .
```

With an env file:

```bash
cp .env.example .env   # then fill in your credentials
docker run --rm -p 3000:3000 --env-file .env cookidoo-mcp
```

Or pass variables directly:

```bash
docker run --rm -p 3000:3000 \
  -e COOKIDOO_EMAIL=your@email.com \
  -e COOKIDOO_PASSWORD=your-password \
  cookidoo-mcp
```

Optional localization and port overrides work the same way (`-e PORT=3010`,
`-e COOKIDOO_COUNTRY_CODE=es`, etc.).

If you set a custom `PORT`, map the same port on the host and in the container
(e.g. `-p 3010:3010` when `PORT=3010`).

The MCP endpoint is then available at `http://localhost:3000/api/mcp` (or your
custom port). A liveness probe is exposed at `GET /api/health` (handy for
Docker/orchestrator health checks).

## Cursor

Cookidoo credentials live in the server `.env` — Cursor only needs the HTTP
endpoint. The server must be running (`pnpm dev` or `pnpm prod`) before Cursor
connects.

1. Copy [`.cursor/mcp.json.example`](.cursor/mcp.json.example) to
   `.cursor/mcp.json`.
2. If you changed `PORT` in `.env`, update the URL port to match (default
   `3000`).
3. Restart Cursor (Settings → Tools & MCP should list **cookidoo**).

Authentication is handled by the NestJS process via `COOKIDOO_EMAIL` /
`COOKIDOO_PASSWORD`; do not put Cookidoo credentials in `mcp.json`.

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
| `cookidoo_mark_ingredient_items` | command | Mark ingredient items as bought/owned |
| `cookidoo_mark_additional_items` | command | Mark free-text items as bought/owned |
| `cookidoo_edit_additional_items` | command | Rename free-text items |
| `cookidoo_add_custom_recipe_ingredients` | command | Add custom recipes' ingredients to the list |
| `cookidoo_remove_custom_recipe_ingredients` | command | Remove custom recipes' ingredients from the list |
| `cookidoo_get_calendar_week` | query | Recipes planned on the meal-planner calendar for a week |
| `cookidoo_add_recipes_to_calendar` | command | Add recipes to the meal-planner calendar on a day |
| `cookidoo_remove_recipe_from_calendar` | command | Remove a recipe from the meal-planner calendar on a day |
| `cookidoo_add_custom_recipes_to_calendar` | command | Add custom recipes to the calendar on a day |
| `cookidoo_remove_custom_recipe_from_calendar` | command | Remove a custom recipe from the calendar on a day |
| `cookidoo_list_custom_recipes` | query | All user-created (custom) recipes |
| `cookidoo_get_custom_recipe` | query | Full details of a custom recipe by id |
| `cookidoo_add_custom_recipe` | command | Create a custom recipe from an existing recipe |
| `cookidoo_remove_custom_recipe` | command | Delete a custom recipe |
| `cookidoo_count_managed_collections` | query | Total managed collections / pages |
| `cookidoo_get_managed_collections` | query | A page of managed collections |
| `cookidoo_add_managed_collection` | command | Subscribe to a managed collection |
| `cookidoo_remove_managed_collection` | command | Unsubscribe from a managed collection |
| `cookidoo_count_custom_collections` | query | Total custom collections / pages |
| `cookidoo_get_custom_collections` | query | A page of custom collections |
| `cookidoo_add_custom_collection` | command | Create a custom collection |
| `cookidoo_remove_custom_collection` | command | Delete a custom collection |
| `cookidoo_add_recipes_to_custom_collection` | command | Add recipes to a custom collection |
| `cookidoo_remove_recipe_from_custom_collection` | command | Remove a recipe from a custom collection |

### Adding a tool

1. Add a Zod input schema under `transport/mcp/schemas/`.
2. Add a Command/Query (+ handler) under `application/` that dispatches to the
   `ICookidooClient` port; extend the port + `CookidooHttpClient` if the
   underlying Cookidoo endpoint isn't wired yet.
3. Add the tool under `transport/mcp/tools/`, tagged with `@McpTool()`, and
   register it in the `MCP_TOOLS` array of `cookidoo.module.ts`.

## Migration status

The migration now covers the full upstream `cookidoo-api` surface: account,
recipe search & details, shopping list (incl. ownership/edit), the meal-planning
calendar, custom recipes, collections (managed/custom) and session persistence
(`save_cookies` / `load_cookies`, here as the optional `COOKIDOO_COOKIE_FILE`).

## License

Licensed under the [GNU General Public License v3.0](LICENSE) — © Sisques Labs.
