import { Injectable } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

import { McpTool } from '../../domain/decorators/mcp-tool.decorator';
import { IMcpTool } from '../../domain/interfaces/mcp-tool.interface';
import { McpToolRegistry } from './mcp-tool-registry.service';

@McpTool()
@Injectable()
class FakeAlphaTool implements IMcpTool {
  readonly name = 'fake_alpha';
  readonly description = 'Alpha';
  readonly inputSchema = {};
  execute(): Promise<CallToolResult> {
    return Promise.resolve({ content: [{ type: 'text', text: 'alpha' }] });
  }
}

@McpTool()
@Injectable()
class FakeBetaTool implements IMcpTool {
  readonly name = 'fake_beta';
  readonly description = 'Beta';
  readonly inputSchema = {};
  execute(): Promise<CallToolResult> {
    return Promise.resolve({ content: [{ type: 'text', text: 'beta' }] });
  }
}

@Injectable()
class NotATool {}

describe('McpToolRegistry', () => {
  let moduleRef: TestingModule;
  let registry: McpToolRegistry;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [McpToolRegistry, FakeAlphaTool, FakeBetaTool, NotATool],
    }).compile();
    await moduleRef.init();
    registry = moduleRef.get(McpToolRegistry);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('discovers only providers tagged with @McpTool()', () => {
    const names = registry.getTools().map((tool) => tool.name);
    expect(names).toContain('fake_alpha');
    expect(names).toContain('fake_beta');
    expect(names).toHaveLength(2);
  });
});
