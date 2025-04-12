# MCP Inspector for Medicine MCP Server

This document provides instructions for using the MCP Inspector to debug and test your Medicine MCP Server.

## What is MCP Inspector?

The MCP Inspector is a powerful developer tool from the Model Context Protocol (MCP) project that allows you to:

1. Interactively test your MCP server resources and tools
2. Monitor server logs and notifications
3. Debug issues with your MCP implementation
4. Verify your server's compliance with the MCP protocol

## How to Run the Inspector

We've added several ways to run the inspector:

### Option 1: Using npm scripts (recommended)

Simply run:
```bash
npm run inspect-dev
```

This will start the Inspector with the development version of the server.

### Option 2: Using the helper script

We've provided a helper script:
```bash
./inspect.sh
```

### Option 3: Running manually

You can also run the inspector manually:
```bash
npx @modelcontextprotocol/inspector ts-node --transpile-only src/mcp-server.ts
```

## Inspector Interface Overview

When the inspector launches, it will open in your browser with the following interface:

### Server Connection Pane (Top)
Shows the connection status and server information.

### Resources Tab
Lists and allows testing of all available resources:
- medicine-db://all
- medicine-db://id/{id}
- medicine-db://symptom/{symptom}

### Tools Tab
Lists and allows testing of all available tools:
- get-all-medicines
- get-medicine-by-id
- get-medicines-by-symptom
- add-medicine
- update-medicine
- delete-medicine

### Log and Notification Pane (Bottom)
Shows logs and notifications from the server.

## Using the Inspector

### Testing Resources
1. Click the "Resources" tab
2. Select a resource from the list
3. Fill in any parameters (e.g., id or symptom)
4. Click "Read Resource"
5. View the results

### Testing Tools
1. Click the "Tools" tab
2. Select a tool from the list
3. Fill in the parameters JSON (examples below)
4. Click "Call Tool"
5. View the results

### Example Tool Parameters

#### get-medicine-by-id
```json
{
  "id": 1
}
```

#### get-medicines-by-symptom
```json
{
  "symptom": "headache"
}
```

#### add-medicine
```json
{
  "name": "Example Medicine",
  "symptoms": ["example symptom", "another symptom"],
  "dosage": "1-2 tablets every 4-6 hours",
  "max_daily_dose": "6 tablets",
  "side_effects": ["drowsiness", "dry mouth"],
  "contraindications": ["liver disease"]
}
```

## Troubleshooting

If you encounter issues with the inspector:

1. Make sure your server implementation correctly follows the MCP protocol
2. Check the console logs for any errors
3. Verify your Zod schemas match the expected parameter types
4. Ensure resources return the correct content types and formats

For more help, see the [MCP Inspector documentation](https://modelcontextprotocol.io/docs/tools/inspector).

