// MCP Protocol Types
export interface MCPMessage {
  id: string;
  type: 'query' | 'response' | 'error';
  content: any;
}

export interface MCPQuery {
  id: string;
  type: 'query';
  action: 'get_medicines_by_symptom' | 'get_medicine_by_id' | 'get_all_medicines';
  parameters: {
    symptom?: string;
    id?: number;
  };
}

export interface MCPResponse {
  id: string;
  type: 'response';
  content: {
    medicines?: Medicine[];
    medicine?: Medicine;
    message?: string;
  };
}

export interface MCPError {
  id: string;
  type: 'error';
  content: {
    message: string;
    code: string;
  };
}

// Medicine Data Model
export interface Medicine {
  id: number;
  name: string;
  symptoms: string[];
  dosage: string;
  max_daily_dose: string;
  side_effects: string[];
  contraindications: string[];
}

export interface MedicineDatabase {
  medicines: Medicine[];
} 