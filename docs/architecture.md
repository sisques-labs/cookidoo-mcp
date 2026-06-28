# cookidoo-mcp — Arquitectura y flujo de comunicación

## Visión general

`cookidoo-mcp` es un servidor [MCP (Model Context Protocol)](https://modelcontextprotocol.io) que conecta herramientas de IA (Claude, Cursor, etc.) con tu cuenta de Cookidoo. Recibe llamadas MCP del cliente de IA y las traduce en peticiones HTTP reales a la API de Cookidoo.

---

## Diagrama de comunicación

```mermaid
flowchart TD
    subgraph AI["🤖 Cliente de IA"]
        Claude["Claude / Cursor / IDE"]
    end

    subgraph Server["cookidoo-mcp (NestJS)"]
        direction TB

        subgraph Transport["Transport — POST /api/mcp"]
            Controller["McpController\n(Streamable HTTP)"]
            McpServer["McpServer\n(instancia por petición)"]
            Tools["MCP Tools\n(@McpTool)"]
            Zod["Zod Schemas\n(validación de entrada)"]
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
            Auth["OAuth2 Cookie Flow\n(login lazy + re-auth en 401)"]
            CookieFile["Cookie File\n(COOKIDOO_COOKIE_FILE, opcional)"]
        end
    end

    subgraph External["☁️ Cookidoo"]
        CookidooAPI["API REST de Cookidoo\nhttps://cookidoo.es"]
    end

    Claude -->|"POST /api/mcp\n(JSON-RPC, MCP Protocol)"| Controller
    Controller --> McpServer
    McpServer --> Tools
    Tools --> Zod
    Tools -->|"dispatch Command/Query"| Commands
    Tools -->|"dispatch Command/Query"| Queries
    Commands --> Handlers
    Queries --> Handlers
    Handlers -->|"llama al puerto"| Port
    Port -.->|"implementado por"| HttpClient
    HttpClient --> Auth
    Auth --> CookieFile
    HttpClient -->|"HTTPS"| CookidooAPI
    CookidooAPI -->|"JSON"| HttpClient
    HttpClient -->|"resultado"| Handlers
    Handlers -->|"respuesta"| Tools
    Tools -->|"tool result (JSON)"| Claude
```

---

## Flujo de una petición paso a paso

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
    Tool->>Tool: validar input con Zod
    Tool->>Bus: QueryBus.execute(SearchRecipesQuery)
    Bus->>Handler: RecipeSearchHandler.execute()
    Handler->>Client: client.searchRecipes(params)
    Client->>API: GET /api/recipes?... (con cookie de sesión)
    API-->>Client: JSON con resultados
    Client-->>Handler: CookidooSearchResult[]
    Handler-->>Bus: resultado mapeado
    Bus-->>Tool: resultado
    Tool-->>MCP: tool result JSON
    MCP-->>AI: respuesta MCP
```

---

## Capas de la arquitectura

| Capa | Ubicación | Responsabilidad |
|---|---|---|
| **Transport** | `src/core/mcp/transport/` | Recibe peticiones HTTP, construye un `McpServer` por petición, registra las tools |
| **MCP Tools** | `src/contexts/cookidoo/transport/mcp/tools/` | Una clase por tool, valida con Zod y despacha al bus |
| **Application** | `src/contexts/cookidoo/application/` | Commands y Queries CQRS; los handlers llaman al puerto |
| **Domain** | `src/contexts/cookidoo/domain/` | Tipos, excepciones, la interfaz `ICookidooClient` (puerto) |
| **Infrastructure** | `src/contexts/cookidoo/infrastructure/` | `CookidooHttpClient`: implementación concreta del puerto, gestiona la sesión OAuth2 |

---

## Autenticación con Cookidoo

```mermaid
flowchart LR
    Start([Primera llamada]) --> HasCookie{¿Cookie\nválida?}
    HasCookie -->|Sí| CallAPI[Llamada a la API]
    HasCookie -->|No| Login[Login OAuth2\ncon email + password]
    Login --> SaveCookie[Guardar cookie\nen COOKIDOO_COOKIE_FILE]
    SaveCookie --> CallAPI
    CallAPI --> Got401{401?}
    Got401 -->|No| Result([Resultado])
    Got401 -->|Sí| Login
```

El cliente es un **singleton**: guarda la sesión en memoria y, si se configura `COOKIDOO_COOKIE_FILE`, la persiste en disco entre reinicios. Un `401` de la API dispara automáticamente un nuevo login sin que el llamador tenga que hacer nada.

---

## Tools disponibles por dominio

```mermaid
mindmap
  root((cookidoo-mcp))
    Cuenta
      get_user_info
      get_active_subscription
    Recetas
      search_recipes
      get_recipe_details
    Lista de la compra
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
    Calendario
      get_calendar_week
      add_recipes_to_calendar
      remove_recipe_from_calendar
      add_custom_recipes_to_calendar
      remove_custom_recipe_from_calendar
    Recetas personalizadas
      list_custom_recipes
      get_custom_recipe
      add_custom_recipe
      remove_custom_recipe
    Colecciones
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
