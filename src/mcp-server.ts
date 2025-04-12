import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import express from 'express';
import http from 'http';

// Define schemas for our medicine data
const SideEffectSchema = z.array(z.string());
const ContraindicationsSchema = z.array(z.string());
const SymptomsSchema = z.array(z.string());

const MedicineSchema = z.object({
  id: z.number(),
  name: z.string(),
  symptoms: SymptomsSchema,
  dosage: z.string(),
  max_daily_dose: z.string(),
  side_effects: SideEffectSchema,
  contraindications: ContraindicationsSchema
});

const MedicinesDatabaseSchema = z.object({
  medicines: z.array(MedicineSchema)
});

type Medicine = z.infer<typeof MedicineSchema>;
type MedicinesDatabase = z.infer<typeof MedicinesDatabaseSchema>;

class MedicineService {
  private medicinesData: MedicinesDatabase = { medicines: [] };
  private dataPath: string;

  constructor(dataPath: string = path.join(__dirname, '../data/medicines.json')) {
    this.dataPath = dataPath;
    this.loadData();
  }

  private loadData(): void {
    try {
      const data = fs.readFileSync(this.dataPath, 'utf8');
      this.medicinesData = JSON.parse(data);
    } catch (error) {
      console.error('Error loading medicine data:', error);
      this.medicinesData = { medicines: [] };
    }
  }

  public saveData(): boolean {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.medicinesData, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving medicine data:', error);
      return false;
    }
  }

  public getAllMedicines(): Medicine[] {
    return this.medicinesData.medicines;
  }

  public getMedicineById(id: number): Medicine | undefined {
    return this.medicinesData.medicines.find(medicine => medicine.id === id);
  }

  public getMedicinesBySymptom(symptom: string): Medicine[] {
    return this.medicinesData.medicines.filter(medicine => 
      medicine.symptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase()))
    );
  }

  public addMedicine(medicine: Omit<Medicine, 'id'>): Medicine {
    // Generate a new ID (the max existing ID + 1)
    const newId = this.medicinesData.medicines.length > 0 
      ? Math.max(...this.medicinesData.medicines.map(m => m.id)) + 1 
      : 1;
    
    const newMedicine: Medicine = {
      ...medicine,
      id: newId
    };
    
    this.medicinesData.medicines.push(newMedicine);
    this.saveData();
    
    return newMedicine;
  }

  public updateMedicine(id: number, medicine: Partial<Omit<Medicine, 'id'>>): Medicine | null {
    const index = this.medicinesData.medicines.findIndex(m => m.id === id);
    
    if (index === -1) {
      return null;
    }
    
    this.medicinesData.medicines[index] = {
      ...this.medicinesData.medicines[index],
      ...medicine
    };
    
    this.saveData();
    
    return this.medicinesData.medicines[index];
  }

  public deleteMedicine(id: number): boolean {
    const initialLength = this.medicinesData.medicines.length;
    this.medicinesData.medicines = this.medicinesData.medicines.filter(m => m.id !== id);
    
    if (initialLength !== this.medicinesData.medicines.length) {
      this.saveData();
      return true;
    }
    
    return false;
  }
}

// Create MCP server
const server = new McpServer({
  name: "Medicine MCP Server",
  version: "1.0.0",
  capabilities: {
    resources: true,
    tools: true,
  }
});

// Initialize medicine service
const medicineService = new MedicineService();

// Register resources
server.resource(
  "medicine-database", 
  new ResourceTemplate("medicine-db://all", { list: undefined }),
  async (uri) => {
    const medicines = medicineService.getAllMedicines();
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify({ medicines }, null, 2)
      }]
    };
  }
);

server.resource(
  "medicine-by-id",
  new ResourceTemplate("medicine-db://id/{id}", { list: undefined }),
  async (uri, { id }) => {
    const medicine = medicineService.getMedicineById(Number(id));
    
    if (!medicine) {
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({ error: `Medicine with ID ${id} not found` })
        }]
      };
    }
    
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(medicine, null, 2)
      }]
    };
  }
);

server.resource(
  "medicine-by-symptom",
  new ResourceTemplate("medicine-db://symptom/{symptom}", { list: undefined }),
  async (uri, { symptom }) => {
    const medicines = medicineService.getMedicinesBySymptom(symptom as string);
    
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify({ 
          symptom, 
          medicines,
          count: medicines.length
        }, null, 2)
      }]
    };
  }
);

// Register tools
server.tool(
  "get-all-medicines",
  {},
  async () => {
    const medicines = medicineService.getAllMedicines();
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ 
          medicines,
          count: medicines.length,
          message: `Found ${medicines.length} medicines`
        }, null, 2)
      }]
    };
  }
);

server.tool(
  "get-medicine-by-id",
  { id: z.number().int().positive() },
  async ({ id }) => {
    const medicine = medicineService.getMedicineById(id);
    
    if (!medicine) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: `Medicine with ID ${id} not found` })
        }],
        isError: true
      };
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ 
          medicine,
          message: `Found medicine: ${medicine.name}`
        }, null, 2)
      }]
    };
  }
);

server.tool(
  "get-medicines-by-symptom",
  { symptom: z.string().min(1) },
  async ({ symptom }) => {
    const medicines = medicineService.getMedicinesBySymptom(symptom);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ 
          symptom,
          medicines,
          count: medicines.length,
          message: `Found ${medicines.length} medicines for symptom: ${symptom}`
        }, null, 2)
      }]
    };
  }
);

server.tool(
  "add-medicine",
  {
    name: z.string().min(1),
    symptoms: z.array(z.string()).min(1),
    dosage: z.string().min(1),
    max_daily_dose: z.string().min(1),
    side_effects: z.array(z.string()),
    contraindications: z.array(z.string())
  },
  async (medicine) => {
    const newMedicine = medicineService.addMedicine(medicine);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ 
          medicine: newMedicine,
          message: `Medicine ${newMedicine.name} added with ID ${newMedicine.id}`
        }, null, 2)
      }]
    };
  }
);

server.tool(
  "update-medicine",
  {
    id: z.number().int().positive(),
    name: z.string().min(1).optional(),
    symptoms: z.array(z.string()).min(1).optional(),
    dosage: z.string().min(1).optional(),
    max_daily_dose: z.string().min(1).optional(),
    side_effects: z.array(z.string()).optional(),
    contraindications: z.array(z.string()).optional()
  },
  async ({ id, ...updateData }) => {
    const updatedMedicine = medicineService.updateMedicine(id, updateData);
    
    if (!updatedMedicine) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: `Medicine with ID ${id} not found` })
        }],
        isError: true
      };
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ 
          medicine: updatedMedicine,
          message: `Medicine ${updatedMedicine.name} updated`
        }, null, 2)
      }]
    };
  }
);

server.tool(
  "delete-medicine",
  { id: z.number().int().positive() },
  async ({ id }) => {
    const deleted = medicineService.deleteMedicine(id);
    
    if (!deleted) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: `Medicine with ID ${id} not found or could not be deleted` })
        }],
        isError: true
      };
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ 
          message: `Medicine with ID ${id} deleted successfully`
        }, null, 2)
      }]
    };
  }
);

// Start the server
async function startServer() {
  try {
    console.log('Starting Medicine MCP Server...');
    
    // Option 1: Use STDIO transport (for AI agent integration)
    if (process.env.TRANSPORT === 'stdio') {
      console.log('Using STDIO transport for MCP server...');
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.log('MCP Server connected via STDIO transport');
    } 
    // Option 2: Use custom HTTP transport (for testing/debugging)
    else {
      console.log('Using HTTP transport for MCP server...');
      const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
      const app = express();
      app.use(express.json());
      
      let requestHandler: any = null;
      
      // MCP endpoint
      app.post('/mcp', async (req, res) => {
        try {
          if (requestHandler) {
            const response = await requestHandler(req.body);
            res.status(200).json(response);
          } else {
            res.status(503).json({ error: 'MCP Server not ready' });
          }
        } catch (error) {
          console.error('Error handling MCP request:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
      
      // Documentation endpoint
      app.get('/', (req, res) => {
        res.status(200).json({
          name: 'Medicine MCP Server',
          description: 'An MCP-compliant server providing medicine information by symptoms',
          version: '1.0.0'
        });
      });
      
      // Health check endpoint
      app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
      });
      
      // Start HTTP server
      const httpServer = http.createServer(app);
      await new Promise<void>((resolve) => {
        httpServer.listen(port, () => {
          console.log(`HTTP server listening on port ${port}`);
          resolve();
        });
      });
      
      // Define custom transport
      const httpTransport = {
        receive: (handler: (message: any) => Promise<any>) => {
          requestHandler = handler;
        },
        start: async () => {
          // Already started the HTTP server above
          return;
        },
        send: async () => {
          // We don't need to implement this for the HTTP transport as responses
          // are sent directly in the request handler
          return;
        },
        close: async () => {
          // Close the HTTP server when needed
          return new Promise<void>((resolve, reject) => {
            httpServer.close((err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      };
      
      // Connect MCP server to our HTTP transport
      await server.connect(httpTransport);
      
      console.log(`MCP Server listening on http://localhost:${port}`);
    }
    
    console.log(`Loaded ${medicineService.getAllMedicines().length} medicines`);
  } catch (error) {
    console.error('Error starting MCP server:', error);
    process.exit(1);
  }
}

// If running directly, start the server
if (require.main === module) {
  startServer();
}

export { server, medicineService, startServer }; 