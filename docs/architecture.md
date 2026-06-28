# cookidoo-mcp — Architecture & Communication Flow

## Overview

`cookidoo-mcp` is an [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that connects AI tools (Claude, Cursor, etc.) to your Cookidoo account. It receives MCP calls from the AI client and translates them into real HTTP requests to the Cookidoo API.

---

## Communication diagram

```mermaid
flowchart TD
    subgraph AI["🤖 AI Client"]
        Claude["Claude / Cursor / IDE"]
    end

    subgraph Server["cookidoo-mcp (NestJS)"]
        direction TB

        subgraph Transport["Transport — POST /api/mcp"]
            Controller["McpController\n(Streamable HTTP)"]
            McpServer["McpServer\n(instance per request)"]
            Tools["MCP Tools\n(@McpTool)"]
            Zod["Zod Schemas\n(input validation)"]
        end

        subgraph Application["Application — CQRS Bus"]
            Commands["Commands\ne.g. AddRecipeIngredients"]
            Queries["Queries\ne.g. SearchRecipes"]
            Handlers["Command / Query Handlers"]
        end

        subgraph Domain["Domain"]
            Port["«interface»\nICookidooClient"]
            Types["Types & Exceptions"]
        end

        subgraph Infrastructure["Infrastructure"]
            HttpClient["CookidooHttpClient\n(singleton)"]
            Auth["OAuth2 Cookie Flow\n(lazy login + re-auth on 401)"]
            CookieFile["Cookie File\n(COOKIDOO_COOKIE_FILE, optional)"]
        end
    end

    subgraph External["☁️ Cookidoo"]
        CookidooAPI["Cookidoo REST API\nhttps://cookidoo.es"]
    end

    Claude -->|"POST /api/mcp\n(JSON-RPC, MCP Protocol)"| Controller
    Controller --> McpServer
    McpServer --> Tools
    Tools --> Zod
    Tools -->|"dispatch Command/Query"| Commands
    Tools -->|"dispatch Command/Query"| Queries
    Commands --> Handlers
    Queries --> Handlers
    Handlers -->|"calls port"| Port
    Port -.->|"implemented by"| HttpClient
    HttpClient --> Auth
    Auth --> CookieFile
    HttpClient -->|"HTTPS"| CookidooAPI
    CookidooAPI -->|"JSON"| HttpClient
    HttpClient -->|"result"| Handlers
    Handlers -->|"response"| Tools
    Tools -->|"tool result (JSON)"| Claude
```

---

## Step-by-step request flow

```mermaid
sequenceDiagram
    participant AI as Claude / Cursor
    participant MCP as McpController
    participant Tool as MCP Tool
    participant Bus as CQRS Bus
    participant Handler as Query/Command Handler
    participant Client as CookidooHttpClient
    participant API as Cookidoo API

    AI->>MCP: POST /api/mcp {tool: "cookidoo_search_recipes", params: {...}}
    MCP->>Tool: dispatch tool call
    Tool->>Tool: validate input with Zod
    Tool->>Bus: QueryBus.execute(SearchRecipesQuery)
    Bus->>Handler: RecipeSearchHandler.execute()
    Handler->>Client: client.searchRecipes(params)
    Client->>API: GET /api/recipes?... (with session cookie)
    API-->>Client: JSON results
    Client-->>Handler: CookidooSearchResult[]
    Handler-->>Bus: mapped result
    Bus-->>Tool: result
    Tool-->>MCP: tool result JSON
    MCP-->>AI: MCP response
```

---

## Architecture layers

| Layer | Location | Responsibility |
|---|---|---|
| **Transport** | `src/core/mcp/transport/` | Receives HTTP requests, builds one `McpServer` per request, registers tools |
| **MCP Tools** | `src/contexts/cookidoo/transport/mcp/tools/` | One class per tool — validates with Zod and dispatches to the bus |
| **Application** | `src/contexts/cookidoo/application/` | CQRS Commands & Queries; handlers call the port |
| **Domain** | `src/contexts/cookidoo/domain/` | Types, exceptions, the `ICookidooClient` interface (port) |
| **Infrastructure** | `src/contexts/cookidoo/infrastructure/` | `CookidooHttpClient`: concrete port implementation, manages the OAuth2 session |

---

## Cookidoo authentication flow

```mermaid
flowchart LR
    Start([First call]) --> HasCookie{Valid\ncookie?}
    HasCookie -->|Yes| CallAPI[Call API]
    HasCookie -->|No| Login[OAuth2 login\nwith email + password]
    Login --> SaveCookie[Save cookie\nto COOKIDOO_COOKIE_FILE]
    SaveCookie --> CallAPI
    CallAPI --> Got401{401?}
    Got401 -->|No| Result([Result])
    Got401 -->|Yes| Login
```

The client is a **singleton**: it keeps the session in memory and, when `COOKIDOO_COOKIE_FILE` is set, persists it to disk across restarts. A `401` from the API automatically triggers a new login — callers never deal with sessions.

---

## Available tools by domain

```mermaid
mindmap
  root((cookidoo-mcp))
    Account
      get_user_info
      get_active_subscription
    Recipes
      search_recipes
      get_recipe_details
    Shopping List
      get_shopping_list_recipes
      get_ingredient_items
      get_additional_items
      add_recipe_ingredients
      remove_recipe_ingredients
      add_additional_items
      remove_additional_items
      clear_shopping_list
      mark_ingredient_items
      mark_additional_items
      edit_additional_items
      add_custom_recipe_ingredients
      remove_custom_recipe_ingredients
    Calendar
      get_calendar_week
      add_recipes_to_calendar
      remove_recipe_from_calendar
      add_custom_recipes_to_calendar
      remove_custom_recipe_from_calendar
    Custom Recipes
      list_custom_recipes
      get_custom_recipe
      add_custom_recipe
      remove_custom_recipe
    Collections
      count_managed_collections
      get_managed_collections
      add_managed_collection
      remove_managed_collection
      count_custom_collections
      get_custom_collections
      add_custom_collection
      remove_custom_collection
      add_recipes_to_custom_collection
      remove_recipe_from_custom_collection
```
