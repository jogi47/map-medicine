import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import MedicineService from './medicineService';
import MCPHandler from './mcpHandler';
import { MCPQuery, MCPMessage, MCPError } from './types';

// Initialize services
const medicineService = new MedicineService();
const mcpHandler = new MCPHandler(medicineService);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create router
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MCP endpoint
router.post('/mcp', (req, res) => {
  const message = req.body as MCPMessage;
  
  console.log(`Received MCP message: ${JSON.stringify(message)}`);
  
  // Validate message format
  if (!message || !message.type) {
    const errorResponse: MCPError = {
      id: message?.id || uuidv4(),
      type: 'error',
      content: {
        message: 'Invalid message format',
        code: 'INVALID_FORMAT'
      }
    };
    return res.status(400).json(errorResponse);
  }

  // Only handle query messages
  if (message.type !== 'query') {
    const errorResponse: MCPError = {
      id: message.id,
      type: 'error',
      content: {
        message: `Unsupported message type: ${message.type}`,
        code: 'UNSUPPORTED_TYPE'
      }
    };
    return res.status(400).json(errorResponse);
  }

  // Process the query
  const query = message as unknown as MCPQuery;
  const response = mcpHandler.handleQuery(query);
  
  // Return appropriate status code
  if (response.type === 'error') {
    return res.status(400).json(response);
  }
  
  return res.status(200).json(response);
});

// Documentation endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'Medicine MCP Server',
    description: 'An MCP-compliant server providing medicine information by symptoms',
    version: '1.0.0',
    endpoints: [
      {
        path: '/mcp',
        method: 'POST',
        description: 'Main MCP endpoint for queries',
        actions: [
          {
            name: 'get_all_medicines',
            description: 'Get all medicines in the database',
            parameters: {}
          },
          {
            name: 'get_medicine_by_id',
            description: 'Get a specific medicine by ID',
            parameters: {
              id: 'number - The ID of the medicine to retrieve'
            }
          },
          {
            name: 'get_medicines_by_symptom',
            description: 'Get medicines that treat a specific symptom',
            parameters: {
              symptom: 'string - The symptom to search for'
            }
          }
        ]
      },
      {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint'
      }
    ]
  });
});

// Use router
app.use('/', router);

// Start the server
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`Loaded ${medicineService.getAllMedicines().length} medicines`);
}); 