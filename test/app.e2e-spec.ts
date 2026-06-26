import { createE2EApp, E2EContext } from './helpers/app-bootstrap';

describe('Cookidoo MCP server (e2e)', () => {
  let ctx: E2EContext;

  beforeAll(async () => {
    ctx = await createE2EApp();
  });

  afterAll(async () => {
    await ctx.close();
  });

  describe('GET /api/health', () => {
    it('returns 200 with status "ok" and a valid timestamp', async () => {
      const res = await ctx.http().get('/api/health').expect(200);

      expect(res.body.status).toBe('ok');
      expect(Number.isNaN(Date.parse(res.body.timestamp as string))).toBe(
        false,
      );
    });
  });

  describe('POST /api/mcp', () => {
    it('completes the MCP initialize handshake', async () => {
      const res = await ctx
        .http()
        .post('/api/mcp')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json, text/event-stream')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'e2e', version: '1.0.0' },
          },
        })
        .expect(200);

      expect(res.body.jsonrpc).toBe('2.0');
      expect(res.body.result.serverInfo.name).toBe('cookidoo-mcp');
      expect(res.body.result.capabilities.tools).toBeDefined();
    });
  });

  describe('unsupported MCP methods', () => {
    it('returns 405 for GET /api/mcp (no sessions)', async () => {
      const res = await ctx.http().get('/api/mcp').expect(405);
      expect(res.body.error.message).toBe('Method not allowed.');
    });

    it('returns 405 for DELETE /api/mcp (no sessions)', async () => {
      await ctx.http().delete('/api/mcp').expect(405);
    });
  });
});
