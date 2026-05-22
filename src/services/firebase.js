import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, remove, update } from 'firebase/database';
import { getMessaging } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLZmMzODVnZCDQZT8iLWFYYWQtNjQzN2ZYTYzYTAz",
  authDomain: "apartemen-management.firebaseapp.com",
  databaseURL: "https://apartemen-management-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "apartemen-management",
  storageBucket: "apartemen-management.firebasestorage.app",
  messagingSenderId: "1097966180816",
  appId: "1:1097966180816:web:8098f2dd75cfed9659b1d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Initialize Firebase Cloud Messaging (optional, hanya jika browser support)
let messaging = null;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.warn('Firebase Messaging not supported:', error);
}

// Database references
export const unitsRef = ref(database, 'units');

// Get all units with realtime listener
export const subscribeToUnits = (callback) => {
  return onValue(unitsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convert object to array
      const unitsArray = Object.keys(data).map(key => ({
        ...data[key],
        firebaseId: key
      }));
      callback(unitsArray);
    } else {
      callback([]);
    }
  });
};

// Add new unit
export const addUnit = async (unit) => {
  const newUnitRef = push(unitsRef);
  await set(newUnitRef, unit);
  return newUnitRef.key;
};

// Update unit
export const updateUnit = async (firebaseId, updates) => {
  const unitRef = ref(database, `units/${firebaseId}`);
  await update(unitRef, updates);
};

// Delete unit
export const deleteUnit = async (firebaseId) => {
  const unitRef = ref(database, `units/${firebaseId}`);
  await remove(unitRef);
};

// Set all units (for initial data)
export const setAllUnits = async (units) => {
  await set(unitsRef, units);
};

export { database };
export { database as db, app, messaging };
