import { createContext, useContext, useState, useEffect } from 'react';
import { requestNotificationPermission, removeFCMToken } from '../services/notificationService';
import { ref, get } from 'firebase/database';
import { database } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fcmToken, setFcmToken] = useState(null);

  // Check if user is logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (username, password) => {
    // Hardcoded admin
    const hardcodedUsers = {
      lia210880: {
        username: 'lia210880',
        password: 'lia210880',
        role: 'admin',
        name: 'Administrator'
      }
    };

    // Check hardcoded admin first
    if (hardcodedUsers[username]) {
      const user = hardcodedUsers[username];
      if (user.password === password) {
        const userData = {
          username: user.username,
          role: user.role,
          name: user.name,
          userId: username.replace(/[@.]/g, '_')
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Request notification permission untuk admin
        try {
          const token = await requestNotificationPermission(userData.userId, user.role);
          if (token) {
            setFcmToken(token);
            console.log('✅ Push notification enabled for admin');
          }
        } catch (error) {
          console.error('Error requesting notification permission:', error);
        }
        
        return { success: true, user: userData };
      }
    }

    // Check Firebase users (employees)
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        
        // Find user by username
        for (const [key, user] of Object.entries(users)) {
          if (user.username === username && user.password === password) {
            const userData = {
              username: user.username,
              role: user.role,
              name: user.name,
              shift: user.shift,
              paymentType: user.paymentType,
              userId: username.replace(/[@.]/g, '_')
            };
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            return { success: true, user: userData };
          }
        }
      }
    } catch (error) {
      console.error('Error checking Firebase users:', error);
    }
    
    return { success: false, error: 'Username atau password salah' };
  };

  // Logout function
  const logout = async () => {
    // Remove FCM token jika ada
    if (fcmToken && user?.userId) {
      try {
        await removeFCMToken(user.userId, fcmToken);
      } catch (error) {
        console.error('Error removing FCM token:', error);
      }
    }
    
    setUser(null);
    setFcmToken(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isPegawai: user?.role === 'pegawai'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
