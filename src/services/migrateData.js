import { setAllUnits } from './firebase';

// Migrate data from localStorage to Firebase
export const migrateLocalStorageToFirebase = async () => {
  try {
    const savedUnits = localStorage.getItem('apartmentUnits');
    
    if (savedUnits) {
      const units = JSON.parse(savedUnits);
      
      // Convert array to object with unique keys
      const unitsObject = {};
      units.forEach(unit => {
        const key = `unit_${unit.id}`;
        unitsObject[key] = unit;
      });
      
      // Upload to Firebase
      await setAllUnits(unitsObject);
      
      console.log('✅ Data migrated to Firebase successfully!');
      console.log(`Migrated ${units.length} units`);
      
      // Optional: Clear localStorage after migration
      // localStorage.removeItem('apartmentUnits');
      
      return true;
    } else {
      console.log('No data to migrate');
      return false;
    }
  } catch (error) {
    console.error('❌ Error migrating data:', error);
    return false;
  }
};
