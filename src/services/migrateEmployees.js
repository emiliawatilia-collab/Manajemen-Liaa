// Script untuk migrate data pegawai yang sudah ada ke Firebase
// Jalankan sekali saja di browser console

import { addEmployee, addUser } from './services/firebase';

const migrateExistingEmployees = async () => {
  const existingEmployees = [
    {
      name: 'Amelia Agustina',
      email: 'ameliaagustina@bylia.com',
      password: 'amel123',
      shift: 'Pagi-Sore',
      shiftStart: '09:00',
      shiftEnd: '17:00',
      paymentType: 'monthly'
    },
    {
      name: 'Devano Erhadinata',
      email: 'devanoerhadinata@bylia.com',
      password: 'deva123',
      shift: 'Sore-Malam',
      shiftStart: '17:00',
      shiftEnd: '00:00',
      paymentType: 'weekly'
    }
  ];

  console.log('🚀 Starting migration...');

  for (const emp of existingEmployees) {
    try {
      // Add employee
      const employeeData = {
        name: emp.name,
        email: emp.email,
        shift: emp.shift,
        shiftStart: emp.shiftStart,
        shiftEnd: emp.shiftEnd,
        paymentType: emp.paymentType,
        createdAt: new Date().toISOString()
      };
      
      await addEmployee(employeeData);
      console.log(`✅ Employee added: ${emp.name}`);
      
      // Add user account
      const userData = {
        username: emp.email,
        password: emp.password,
        role: 'pegawai',
        name: emp.name,
        shift: {
          start: emp.shiftStart,
          end: emp.shiftEnd,
          name: emp.shift
        },
        paymentType: emp.paymentType
      };
      
      await addUser(userData);
      console.log(`✅ User account created: ${emp.email}`);
      
    } catch (error) {
      console.error(`❌ Error migrating ${emp.name}:`, error);
    }
  }

  console.log('🎉 Migration completed!');
};

// Export function
export { migrateExistingEmployees };
