import {
  Controller,
  Delete,
  Get,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Request, Response } from 'express';

import { McpServerFactory } from '../application/services/mcp-server.factory';

/**
 * MCP transport entry point (Streamable HTTP, stateless).
 *
 * Exposed at `POST /api/mcp`. A new MCP server + transport is created per
 * request (no session state). The server acts as the single Cookidoo account
 * configured via environment variables, so there is no per-request auth to
 * enforce here — credentials live in the infrastructure client.
 */
@Controller('mcp')
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(private readonly mcpServerFactory: McpServerFactory) {}

  @Post()
  async handleRequest(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log('MCP request received');

    const server = this.mcpServerFactory.create();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      // Reply with a single JSON-RPC response instead of an SSE stream — the
      // tools are request/response only, so clients get plain application/json.
      enableJsonResponse: true,
    });

    res.on('close', () => {
      void transport.close();
      void server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }

  @Get()
  handleGet(@Res() res: Response): void {
    this.methodNotAllowed(res);
  }

  @Delete()
  handleDelete(@Res() res: Response): void {
    this.methodNotAllowed(res);
  }

  /**
   * Stateless transport keeps no session, so the SSE stream (GET) and session
   * termination (DELETE) defined by the spec are not supported.
   */
  private methodNotAllowed(res: Response): void {
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed.' },
      id: null,
    });
  }
}
