import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { MCPQuery, MCPResponse, MCPError } from './types';

const SERVER_URL = 'http://localhost:3000/mcp';

/**
 * Example function to query the MCP server
 */
async function queryMCPServer(query: MCPQuery): Promise<MCPResponse | MCPError> {
  try {
    const response = await axios.post(SERVER_URL, query);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data as MCPError;
    }
    
    // Create a generic error if the server didn't return a proper error
    return {
      id: query.id,
      type: 'error',
      content: {
        message: `Failed to connect to MCP server: ${error.message}`,
        code: 'CONNECTION_ERROR'
      }
    };
  }
}

/**
 * Example usage of the MCP server
 */
async function runExamples() {
  console.log('MCP Client Example');
  console.log('=================\n');

  // Example 1: Get all medicines
  console.log('Example 1: Get all medicines');
  const getAllQuery: MCPQuery = {
    id: uuidv4(),
    type: 'query',
    action: 'get_all_medicines',
    parameters: {}
  };
  
  const allMedicinesResponse = await queryMCPServer(getAllQuery);
  console.log(`Response: ${allMedicinesResponse.type}`);
  console.log(`Message: ${(allMedicinesResponse as MCPResponse).content.message}`);
  console.log(`Total medicines: ${(allMedicinesResponse as MCPResponse).content.medicines?.length || 0}`);
  console.log();
  
  // Example 2: Get medicine by ID
  console.log('Example 2: Get medicine by ID');
  const getByIdQuery: MCPQuery = {
    id: uuidv4(),
    type: 'query',
    action: 'get_medicine_by_id',
    parameters: {
      id: 5
    }
  };
  
  const medicineByIdResponse = await queryMCPServer(getByIdQuery);
  if (medicineByIdResponse.type === 'response') {
    console.log(`Found medicine: ${medicineByIdResponse.content.medicine?.name}`);
    console.log(`Treats: ${medicineByIdResponse.content.medicine?.symptoms.join(', ')}`);
  } else {
    console.log(`Error: ${medicineByIdResponse.content.message}`);
  }
  console.log();
  
  // Example 3: Get medicines by symptom
  console.log('Example 3: Get medicines by symptom');
  const getBySymptomQuery: MCPQuery = {
    id: uuidv4(),
    type: 'query',
    action: 'get_medicines_by_symptom',
    parameters: {
      symptom: 'headache'
    }
  };
  
  const medicinesBySymptomResponse = await queryMCPServer(getBySymptomQuery);
  if (medicinesBySymptomResponse.type === 'response') {
    console.log(`Found ${medicinesBySymptomResponse.content.medicines?.length} medicines for headache`);
    medicinesBySymptomResponse.content.medicines?.forEach(medicine => {
      console.log(`- ${medicine.name} (Dosage: ${medicine.dosage})`);
    });
  } else {
    console.log(`Error: ${medicinesBySymptomResponse.content.message}`);
  }
  console.log();
  
  // Example 4: Invalid query (missing required parameter)
  console.log('Example 4: Invalid query');
  const invalidQuery: MCPQuery = {
    id: uuidv4(),
    type: 'query',
    action: 'get_medicine_by_id',
    parameters: {}
  };
  
  const invalidResponse = await queryMCPServer(invalidQuery);
  console.log(`Response type: ${invalidResponse.type}`);
  console.log(`Error message: ${invalidResponse.content.message}`);
  console.log(`Error code: ${(invalidResponse as MCPError).content.code}`);
}

// Run the examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
} 