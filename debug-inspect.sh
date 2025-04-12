#!/bin/bash
echo "Starting MCP Inspector with DEBUG output..."
DEBUG=* npx @modelcontextprotocol/inspector ts-node --transpile-only src/mcp-server.ts
