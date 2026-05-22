import { useState, useEffect } from 'react';
import { subscribeToUnits, addUnit, updateUnit, deleteUnit } from '../services/firebase';
import { clearNotificationFlag } from '../services/checkoutMonitor';

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

  // Checkout unit (set to empty and save to history)
  const checkoutUnit = async (firebaseId) => {
    try {
      // Get unit data before checkout
      const unit = units.find(u => u.firebaseId === firebaseId);
      
      if (unit && unit.tenant) {
        // Clear notification flag
        clearNotificationFlag(firebaseId, unit.tenant.checkOut);
        
        // Save current tenant to history
        const currentHistory = unit.history || [];
        const updatedHistory = [...currentHistory, unit.tenant];
        
        // Update unit: set to empty and add to history
        await updateUnit(firebaseId, {
          status: 'kosong',
          tenant: null,
          history: updatedHistory
        });
        
        console.log('✅ Checkout successful, saved to history:', unit.tenant.name);
      } else {
        // No tenant, just set to empty
        await updateUnit(firebaseId, {
          status: 'kosong',
          tenant: null
        });
      }
    } catch (err) {
      console.error('❌ Checkout error:', err);
      setError(err);
      throw err;
    }
  };

  // Book unit (set tenant)
  const bookUnit = async (firebaseId, tenantData) => {
    try {
      // Check if check-in date is in the future
      const checkInDate = new Date(tenantData.checkIn);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      checkInDate.setHours(0, 0, 0, 0);
      
      // If check-in is today or past, status = 'terisi'
      // If check-in is future, status = 'booking'
      const status = checkInDate <= today ? 'terisi' : 'booking';
      
      await updateUnit(firebaseId, {
        status: status,
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

  // Check and update booking status (convert 'booking' to 'terisi' if check-in date has arrived)
  const updateBookingStatus = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bookingUnits = units.filter(u => u.status === 'booking' && u.tenant);
    
    for (const unit of bookingUnits) {
      const checkInDate = new Date(unit.tenant.checkIn);
      checkInDate.setHours(0, 0, 0, 0);
      
      // If check-in date has arrived or passed, change status to 'terisi'
      if (checkInDate <= today) {
        try {
          await updateUnit(unit.firebaseId, {
            status: 'terisi',
            tenant: unit.tenant
          });
          console.log(`✅ Unit ${unit.unitNumber} status updated from 'booking' to 'terisi'`);
        } catch (err) {
          console.error(`❌ Failed to update unit ${unit.unitNumber}:`, err);
        }
      }
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
    extendBooking,
    updateBookingStatus
  };
};
