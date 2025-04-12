#!/bin/bash
echo "Starting the server directly (NOT through the inspector)..."
ts-node --transpile-only src/mcp-server.ts
