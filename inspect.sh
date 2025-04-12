#!/bin/bash
echo "Starting MCP Inspector for Medicine MCP Server..."
npx @modelcontextprotocol/inspector ts-node --transpile-only src/mcp-server.ts
