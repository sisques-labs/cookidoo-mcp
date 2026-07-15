# cookidoo-mcp

An [MCP](https://modelcontextprotocol.io) server for **Cookidoo**, built with NestJS. It exposes a Cookidoo account (recipes, shopping list, meal planner, collections, and more) to AI tools such as Claude, Cursor, and other MCP clients.

Cookidoo credentials are configured on the server via environment variables. MCP clients only need the HTTP endpoint — they do not store your Cookidoo password.

## Image tags

Published images are available on:

- **Docker Hub:** `sisqueslabs/cookidoo-mcp`
- **GitHub Container Registry:** `ghcr.io/sisques-labs/cookidoo-mcp`

| Tag | Description |
|-----|-------------|
| `latest` | Latest stable release |
| `X.Y.Z` | Specific semver release (e.g. `0.3.1`) |
| `X.Y.Z-alpha.N`, `X.Y.Z-beta.N`, `X.Y.Z-rc.N` | Pre-release channels when published |

```bash
docker pull sisqueslabs/cookidoo-mcp:latest
```

## Quick start

Replace the placeholders with your Cookidoo account credentials:

```bash
docker run --rm -p 3000:3000 \
  -e COOKIDOO_EMAIL=your@email.com \
  -e COOKIDOO_PASSWORD=your-password \
  sisqueslabs/cookidoo-mcp:latest
```

The MCP endpoint is then available at:

```
http://localhost:3000/api/mcp
```

Verify the container is running:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{"status":"ok","timestamp":"..."}
```

## Configuration

### Required environment variables

| Variable | Description |
|----------|-------------|
| `COOKIDOO_EMAIL` | Cookidoo account email |
| `COOKIDOO_PASSWORD` | Cookidoo account password |

### Optional environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port the server listens on |
| `COOKIDOO_COUNTRY_CODE` | `es` | Localization country code |
| `COOKIDOO_LANGUAGE` | `es-ES` | Localization language |
| `COOKIDOO_URL` | `https://cookidoo.es/foundation/es-ES` | Localization base URL |
| `COOKIDOO_COOKIE_FILE` | — | Path inside the container to persist the session across restarts |
| `COOKIDOO_DEBUG` | `false` | Set to `true` to log the full OAuth2 login flow when debugging authentication |

Override all three localization variables together to target another market. Examples:

| Market | `COOKIDOO_COUNTRY_CODE` | `COOKIDOO_LANGUAGE` | `COOKIDOO_URL` |
|--------|-------------------------|---------------------|----------------|
| Spain | `es` | `es-ES` | `https://cookidoo.es/foundation/es-ES` |
| Switzerland | `ch` | `de-CH` | `https://cookidoo.ch/foundation/de-CH` |
| United Kingdom | `gb` | `en-GB` | `https://cookidoo.co.uk/foundation/en-GB` |

If you change `PORT`, map the same port on the host (e.g. `-p 3010:3010` when `PORT=3010`).

## Running with an env file

Create a `.env` file (do not commit it):

```env
COOKIDOO_EMAIL=your@email.com
COOKIDOO_PASSWORD=your-password
PORT=3000
```

Run the container:

```bash
docker run --rm -p 3000:3000 --env-file .env sisqueslabs/cookidoo-mcp:latest
```

## Session persistence

By default the Cookidoo session lives only in memory. Every container restart triggers a fresh login.

To reuse the session across restarts, set `COOKIDOO_COOKIE_FILE` to a writable path and mount a volume:

```bash
docker run --rm -p 3000:3000 \
  -e COOKIDOO_EMAIL=your@email.com \
  -e COOKIDOO_PASSWORD=your-password \
  -e COOKIDOO_COOKIE_FILE=/data/.cookidoo-session.json \
  -v cookidoo-session:/data \
  sisqueslabs/cookidoo-mcp:latest
```

The session file contains cookies — treat it like a credential. Restrict volume permissions and never share it.

## Docker Compose

Minimal `compose.yml`:

```yaml
services:
  cookidoo-mcp:
    image: sisqueslabs/cookidoo-mcp:latest
    ports:
      - "3000:3000"
    environment:
      COOKIDOO_EMAIL: your@email.com
      COOKIDOO_PASSWORD: your-password
      COOKIDOO_COOKIE_FILE: /data/.cookidoo-session.json
    volumes:
      - cookidoo-session:/data
    restart: unless-stopped

volumes:
  cookidoo-session:
```

Start it:

```bash
docker compose up -d
```

## Connecting MCP clients

The server must be running before a client connects. Point your MCP client at the Streamable HTTP endpoint:

```
http://<host>:<port>/api/mcp
```

Replace `<host>` with `localhost` when the client runs on the same machine, or the container/host IP otherwise.

### Cursor

Create or edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "cookidoo": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

If you changed `PORT`, update the URL accordingly. Restart Cursor so it picks up the server (Settings → Tools & MCP should list **cookidoo**).

Do **not** put Cookidoo credentials in `mcp.json` — authentication is handled by this container via `COOKIDOO_EMAIL` and `COOKIDOO_PASSWORD`.

## Available MCP tools

Once connected, the server exposes tools to manage your Cookidoo account, including:

- Account info and active subscription
- Recipe search and details
- Shopping list (ingredients, additional items, mark as bought, clear)
- Meal-planner calendar (weekly view, add/remove recipes)
- Custom recipes (create, list, details, delete)
- Collections (managed and custom)

See the [project README](https://github.com/sisques-labs/cookidoo-mcp#tools) for the full tool list.

## Health checks

A liveness probe is exposed at `GET /api/health`. It is unauthenticated and does not call Cookidoo, so it is safe for orchestrators and uptime monitors.

Example Docker Compose health check:

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 10s
```

Adjust the port if you override `PORT`.

## Troubleshooting

**Container exits immediately**

- Check that `COOKIDOO_EMAIL` and `COOKIDOO_PASSWORD` are set and valid.
- Inspect logs: `docker logs <container-id>`.

**Authentication failures**

- Set `COOKIDOO_DEBUG=true` and review the OAuth2 login trace in the logs.
- Confirm localization variables match your Cookidoo market.

**Client cannot connect**

- Ensure the container is running and the port is published (`-p 3000:3000`).
- Confirm the MCP URL uses the correct host and port.
- The transport is Streamable HTTP at `POST /api/mcp`; `GET` and `DELETE` on that path return `405`.

## Links

- **Source code:** https://github.com/sisques-labs/cookidoo-mcp
- **MCP specification:** https://modelcontextprotocol.io
- **License:** GNU General Public License v3.0
