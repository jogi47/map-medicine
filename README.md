# Medicine MCP Server

This is an MCP (Model Context Protocol) compliant server that provides access to a database of medicines organized by symptoms. This server follows the official MCP protocol specification, allowing other language models (LLMs) to query and update the medicine database.

## Features

- Full MCP protocol support using the official `@modelcontextprotocol/sdk`
- Zod schema validation for all data
- Support for both StdioServerTransport (for LLM integration) and HTTP transport (for testing)
- JSON database of 50+ medicines with detailed information
- Rich set of MCP resources and tools
- Ability to query, add, update, and delete medicines

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mcp-demo.git
cd mcp-demo
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will be running at http://localhost:3000.

4. In a separate terminal, run the example client:
```bash
npm run client
```

## Using with LLMs

This server implements the official MCP (Model Context Protocol) standard, which allows Language Learning Models (LLMs) to communicate with external tools and data sources in a standardized way.

### MCP Resources

The server exposes the following resources:

- `medicine-db://all` - Get all medicines
- `medicine-db://id/{id}` - Get medicine by ID
- `medicine-db://symptom/{symptom}` - Get medicines by symptom

### MCP Tools

The server provides the following tools:

- `get-all-medicines` - Get all medicines
- `get-medicine-by-id` - Get a medicine by ID
- `get-medicines-by-symptom` - Get medicines for a symptom
- `add-medicine` - Add a new medicine
- `update-medicine` - Update an existing medicine
- `delete-medicine` - Delete a medicine

### Example Client Usage

```typescript
// Example using the MCP client
import { MCPClient } from './src/mcp-client';

async function main() {
  const client = new MCPClient('http://localhost:3000');
  
  // Query medicines for headache
  const result = await client.callTool({
    name: "get-medicines-by-symptom",
    arguments: {
      symptom: "headache"
    }
  });
  
  console.log(result.content[0].text);
}

main().catch(console.error);
```

## Medicine Data Structure

Each medicine in the database has the following structure:

```typescript
interface Medicine {
  id: number;
  name: string;
  symptoms: string[];
  dosage: string;
  max_daily_dose: string;
  side_effects: string[];
  contraindications: string[];
}
```

## Technology

- TypeScript/Node.js
- Zod for schema validation
- Express.js for HTTP transport
- Model Context Protocol SDK

## License

MIT
