import fs from 'fs';
import path from 'path';
import { Medicine, MedicineDatabase } from './types';

class MedicineService {
  private medicinesData: MedicineDatabase = { medicines: [] };
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
}

export default MedicineService; 