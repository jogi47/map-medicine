import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface ToolCallOptions {
  name: string;
  arguments: Record<string, any>;
}

interface ResourceReadOptions {
  uri: string;
}

class MCPClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }
  
  async callTool(options: ToolCallOptions) {
    try {
      const response = await axios.post(`${this.baseUrl}/mcp`, {
        id: uuidv4(),
        type: 'query',
        action: options.name,
        parameters: options.arguments
      });
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error) {
      console.error('Error calling tool:', error);
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message || 'Unknown error'}`
        }],
        isError: true
      };
    }
  }
  
  async readResource(options: ResourceReadOptions) {
    try {
      // In a real implementation, we would handle this properly with MCP
      // For now, we'll simulate it by extracting resource parameters
      let endpoint = '/mcp';
      
      // Parse the URI to determine what to request
      if (options.uri.startsWith('medicine-db://all')) {
        const toolResponse = await this.callTool({ 
          name: 'get-all-medicines',
          arguments: {} 
        });
        
        return {
          contents: [{
            uri: options.uri,
            text: toolResponse.content[0].text
          }]
        };
      } 
      else if (options.uri.startsWith('medicine-db://id/')) {
        const id = options.uri.split('/').pop();
        const toolResponse = await this.callTool({ 
          name: 'get-medicine-by-id',
          arguments: { id: parseInt(id) } 
        });
        
        return {
          contents: [{
            uri: options.uri,
            text: toolResponse.content[0].text
          }]
        };
      }
      else if (options.uri.startsWith('medicine-db://symptom/')) {
        const symptom = options.uri.split('/').pop();
        const toolResponse = await this.callTool({ 
          name: 'get-medicines-by-symptom',
          arguments: { symptom } 
        });
        
        return {
          contents: [{
            uri: options.uri,
            text: toolResponse.content[0].text
          }]
        };
      }
      
      return {
        contents: [{
          uri: options.uri,
          text: JSON.stringify({ error: 'Resource not found' })
        }]
      };
    } catch (error) {
      console.error('Error reading resource:', error);
      return {
        contents: [{
          uri: options.uri,
          text: JSON.stringify({ error: error.message || 'Unknown error' })
        }]
      };
    }
  }
  
  async getServerInfo() {
    try {
      const response = await axios.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error getting server info:', error);
      return { error: 'Unable to get server information' };
    }
  }
  
  async listTools() {
    // In a real implementation, we would query the server for the list of tools
    // For now, we'll hardcode the tools we know are available
    return [
      { name: 'get-all-medicines', description: 'Get all medicines' },
      { name: 'get-medicine-by-id', description: 'Get a medicine by ID' },
      { name: 'get-medicines-by-symptom', description: 'Get medicines for a symptom' },
      { name: 'add-medicine', description: 'Add a new medicine' },
      { name: 'update-medicine', description: 'Update an existing medicine' },
      { name: 'delete-medicine', description: 'Delete a medicine' }
    ];
  }
  
  async listResources() {
    // In a real implementation, we would query the server for the list of resources
    // For now, we'll hardcode the resources we know are available
    return [
      { name: 'medicine-database', description: 'Access all medicines' },
      { name: 'medicine-by-id', description: 'Access a medicine by ID' },
      { name: 'medicine-by-symptom', description: 'Access medicines by symptom' }
    ];
  }
}

async function runExamples() {
  console.log('MCP Client Example');
  console.log('=================\n');

  try {
    // Create a client
    const client = new MCPClient('http://localhost:3000');
    
    // Get server information
    const serverInfo = await client.getServerInfo();
    console.log('Server Information:');
    console.log(JSON.stringify(serverInfo, null, 2));
    console.log();
    
    // Example 1: List all tools
    console.log('Example 1: Listing all available tools');
    const tools = await client.listTools();
    console.log('Available tools:');
    tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description || 'No description'}`);
    });
    console.log();
    
    // Example 2: List all resources
    console.log('Example 2: Listing all available resources');
    const resources = await client.listResources();
    console.log('Available resources:');
    resources.forEach(resource => {
      console.log(`- ${resource.name}: ${resource.description || 'No description'}`);
    });
    console.log();
    
    // Example 3: Get all medicines using a tool
    console.log('Example 3: Getting all medicines using a tool');
    const getAllResult = await client.callTool({
      name: "get-all-medicines",
      arguments: {}
    });
    console.log('Result (from tool):');
    console.log(getAllResult.content[0].text);
    console.log();
    
    // Example 4: Get medicines by symptom using a tool
    console.log('Example 4: Getting medicines for headache');
    const getBySymptomResult = await client.callTool({
      name: "get-medicines-by-symptom",
      arguments: {
        symptom: "headache"
      }
    });
    console.log('Result (from tool):');
    console.log(getBySymptomResult.content[0].text);
    console.log();
    
    // Example 5: Access a resource
    console.log('Example 5: Reading medicine database resource');
    const resourceResult = await client.readResource({
      uri: "medicine-db://all"
    });
    console.log('Resource content:');
    console.log(resourceResult.contents[0].text);
    console.log();
    
    // Example 6: Add a new medicine
    console.log('Example 6: Adding a new medicine');
    const addMedicineResult = await client.callTool({
      name: "add-medicine",
      arguments: {
        name: "Acetaminophen",
        symptoms: ["headache", "fever", "pain"],
        dosage: "325-650mg every 4-6 hours as needed",
        max_daily_dose: "3000mg",
        side_effects: ["liver damage (with overdose)", "nausea"],
        contraindications: ["liver disease", "alcoholism"]
      }
    });
    console.log('Result (from tool):');
    console.log(addMedicineResult.content[0].text);
    console.log();
    
    // Example 7: Update a medicine
    console.log('Example 7: Updating a medicine');
    // Assuming the first medicine has ID 1
    const updateMedicineResult = await client.callTool({
      name: "update-medicine",
      arguments: {
        id: 1,
        max_daily_dose: "1500mg",  // Updated value
        side_effects: ["stomach upset", "heartburn", "dizziness", "rash"]  // Added a new side effect
      }
    });
    console.log('Result (from tool):');
    console.log(updateMedicineResult.content[0].text);
    console.log();
    
    // Example 8: Get medicine by ID
    console.log('Example 8: Getting medicine by ID');
    const getByIdResult = await client.callTool({
      name: "get-medicine-by-id",
      arguments: {
        id: 1
      }
    });
    console.log('Result (from tool):');
    console.log(getByIdResult.content[0].text);
    console.log();
    
    // Example 9: Reading medicine by symptom resource
    console.log('Example 9: Reading medicine by symptom resource');
    const symptomResourceResult = await client.readResource({
      uri: "medicine-db://symptom/headache"
    });
    console.log('Resource content:');
    console.log(symptomResourceResult.contents[0].text);
    console.log();
    
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export { runExamples }; 