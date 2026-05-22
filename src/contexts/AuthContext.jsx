import { createContext, useContext, useState, useEffect } from 'react';
import { requestNotificationPermission, removeFCMToken } from '../services/notificationService';

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
    // Hardcoded users (bisa diganti dengan Firebase Auth nanti)
    const users = {
      lia210880: {
        username: 'lia210880',
        password: 'lia210880',
        role: 'admin',
        name: 'Administrator'
      },
      'ameliaagustina@bylia.com': {
        username: 'ameliaagustina@bylia.com',
        password: 'amel123',
        role: 'pegawai',
        name: 'Amelia Agustina',
        shift: {
          start: '09:00',
          end: '17:00',
          name: 'Pagi-Sore'
        },
        paymentType: 'monthly' // monthly or weekly
      },
      'devanoerhadinata@bylia.com': {
        username: 'devanoerhadinata@bylia.com',
        password: 'deva123',
        role: 'pegawai',
        name: 'Devano Erhadinata',
        shift: {
          start: '17:00',
          end: '00:00',
          name: 'Sore-Malam'
        },
        paymentType: 'weekly' // monthly or weekly
      }
    };

    const user = users[username];
    
    if (user && user.password === password) {
      const userData = {
        username: user.username,
        role: user.role,
        name: user.name,
        shift: user.shift,
        userId: username.replace(/[@.]/g, '_') // Generate userId dari username
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Request notification permission untuk admin
      if (user.role === 'admin') {
        try {
          const token = await requestNotificationPermission(userData.userId, user.role);
          if (token) {
            setFcmToken(token);
            console.log('✅ Push notification enabled for admin');
          }
        } catch (error) {
          console.error('Error requesting notification permission:', error);
        }
      }
      
      return { success: true, user: userData };
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
