import { useState, useEffect } from 'react';
import { subscribeToUnits, addUnit, updateUnit, deleteUnit } from '../services/firebase';

export const useUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    // Subscribe to realtime updates
    const unsubscribe = subscribeToUnits((data) => {
      setUnits(data);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Add new unit
  const createUnit = async (unitData) => {
    try {
      const firebaseId = await addUnit(unitData);
      return firebaseId;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Update existing unit
  const modifyUnit = async (firebaseId, updates) => {
    try {
      await updateUnit(firebaseId, updates);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Delete unit
  const removeUnit = async (firebaseId) => {
    try {
      await deleteUnit(firebaseId);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Checkout unit (set to empty)
  const checkoutUnit = async (firebaseId) => {
    try {
      await updateUnit(firebaseId, {
        status: 'kosong',
        tenant: null
      });
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Book unit (set tenant)
  const bookUnit = async (firebaseId, tenantData) => {
    try {
      await updateUnit(firebaseId, {
        status: 'terisi',
        tenant: tenantData
      });
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Extend booking
  const extendBooking = async (firebaseId, newCheckOut, newCheckOutTime) => {
    try {
      const unit = units.find(u => u.firebaseId === firebaseId);
      if (unit && unit.tenant) {
        await updateUnit(firebaseId, {
          tenant: {
            ...unit.tenant,
            checkOut: newCheckOut,
            checkOutTime: newCheckOutTime || unit.tenant.checkOutTime
          }
        });
      }
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return {
    units,
    loading,
    error,
    createUnit,
    modifyUnit,
    removeUnit,
    checkoutUnit,
    bookUnit,
    extendBooking
  };
};
