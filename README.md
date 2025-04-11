# Medicine MCP Server

This is an MCP (Machine Conversation Protocol) compliant server that provides access to a database of medicines organized by symptoms. This server allows other language models (LLMs) to query the database and retrieve information about medicines for various symptoms.

## Features

- MCP protocol support for communication with LLMs
- JSON database of 50+ medicines with detailed information
- Query medicines by symptom, ID, or get all medicines
- Standardized error handling
- Simple HTTP API

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

> **Note:** Due to some type definition issues with Express, the server runs in TypeScript transpile-only mode. This doesn't affect functionality but bypasses some type checking.

## API Documentation

### MCP Endpoint

**URL**: `/mcp`
**Method**: `POST`

The MCP endpoint accepts messages in the following format:

```json
{
  "id": "unique-message-id",
  "type": "query",
  "action": "action-name",
  "parameters": {
    // action-specific parameters
  }
}
```

### Available Actions

1. **get_all_medicines**
   - Returns all medicines in the database
   - No parameters required

2. **get_medicine_by_id**
   - Returns a specific medicine by ID
   - Parameters:
     - `id` (number): The ID of the medicine to retrieve

3. **get_medicines_by_symptom**
   - Returns medicines that treat a specific symptom
   - Parameters:
     - `symptom` (string): The symptom to search for

### Example Requests

#### Get All Medicines

```json
{
  "id": "1234",
  "type": "query",
  "action": "get_all_medicines",
  "parameters": {}
}
```

#### Get Medicine by ID

```json
{
  "id": "1235",
  "type": "query",
  "action": "get_medicine_by_id",
  "parameters": {
    "id": 5
  }
}
```

#### Get Medicines by Symptom

```json
{
  "id": "1236",
  "type": "query",
  "action": "get_medicines_by_symptom",
  "parameters": {
    "symptom": "headache"
  }
}
```

### Response Format

Success responses:

```json
{
  "id": "original-request-id",
  "type": "response",
  "content": {
    "medicines": [...],  // For multiple medicines
    "medicine": {...},   // For a single medicine
    "message": "Human-readable message"
  }
}
```

Error responses:

```json
{
  "id": "original-request-id",
  "type": "error",
  "content": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Client Example

A client example is provided in `src/client-example.ts`. Run it after starting the server:

```bash
npx ts-node src/client-example.ts
```

## Medicine Data

The medicine database includes information about:

- Medicine name
- Applicable symptoms
- Dosage information
- Maximum daily dose
- Side effects
- Contraindications

## Using with LLMs

This server implements the MCP (Machine Conversation Protocol) standard, which allows Language Learning Models (LLMs) to communicate with external tools and data sources. 

When an LLM needs to query medicine information, it can send a structured MCP request to this server. For example:

1. A user asks an LLM: "What medicines can help with my headache?"
2. The LLM recognizes it needs external data and prepares an MCP query
3. The LLM sends: `{"id": "unique-id", "type": "query", "action": "get_medicines_by_symptom", "parameters": {"symptom": "headache"}}`
4. Our MCP server processes this request and returns matching medicines
5. The LLM receives the response and formats a human-readable answer about headache medicines

The MCP protocol provides a standardized way for LLMs to access external data and tools without requiring custom integrations for each use case.

## License

MIT # map-medicine
