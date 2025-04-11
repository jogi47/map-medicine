import { v4 as uuidv4 } from 'uuid';
import { MCPQuery, MCPResponse, MCPError } from './types';
import MedicineService from './medicineService';

class MCPHandler {
  private medicineService: MedicineService;

  constructor(medicineService: MedicineService) {
    this.medicineService = medicineService;
  }

  public handleQuery(query: MCPQuery): MCPResponse | MCPError {
    try {
      if (!query.id || !query.action) {
        return this.createError(query.id || uuidv4(), 'Invalid query format', 'INVALID_FORMAT');
      }

      switch (query.action) {
        case 'get_all_medicines':
          return this.getAllMedicines(query.id);
          
        case 'get_medicine_by_id':
          if (query.parameters?.id === undefined) {
            return this.createError(query.id, 'Missing medicine ID parameter', 'MISSING_PARAMETER');
          }
          return this.getMedicineById(query.id, query.parameters.id);
          
        case 'get_medicines_by_symptom':
          if (!query.parameters?.symptom) {
            return this.createError(query.id, 'Missing symptom parameter', 'MISSING_PARAMETER');
          }
          return this.getMedicinesBySymptom(query.id, query.parameters.symptom);
          
        default:
          return this.createError(query.id, `Unknown action: ${query.action}`, 'UNKNOWN_ACTION');
      }
    } catch (error) {
      console.error('Error handling MCP query:', error);
      return this.createError(
        query.id || uuidv4(),
        'Internal server error',
        'INTERNAL_ERROR'
      );
    }
  }

  private getAllMedicines(queryId: string): MCPResponse {
    const medicines = this.medicineService.getAllMedicines();
    return {
      id: queryId,
      type: 'response',
      content: {
        medicines,
        message: `Found ${medicines.length} medicines`
      }
    };
  }

  private getMedicineById(queryId: string, id: number): MCPResponse | MCPError {
    const medicine = this.medicineService.getMedicineById(id);
    
    if (!medicine) {
      return this.createError(queryId, `Medicine with ID ${id} not found`, 'NOT_FOUND');
    }
    
    return {
      id: queryId,
      type: 'response',
      content: {
        medicine,
        message: `Found medicine: ${medicine.name}`
      }
    };
  }

  private getMedicinesBySymptom(queryId: string, symptom: string): MCPResponse {
    const medicines = this.medicineService.getMedicinesBySymptom(symptom);
    
    return {
      id: queryId,
      type: 'response',
      content: {
        medicines,
        message: `Found ${medicines.length} medicines for symptom: ${symptom}`
      }
    };
  }

  private createError(queryId: string, message: string, code: string): MCPError {
    return {
      id: queryId,
      type: 'error',
      content: {
        message,
        code
      }
    };
  }
}

export default MCPHandler; 