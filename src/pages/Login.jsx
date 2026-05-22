import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faCamera } from '@fortawesome/free-solid-svg-icons';
import FaceLogin from '../components/FaceLogin';
import Swal from 'sweetalert2';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFaceLogin, setShowFaceLogin] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/', { replace: true });
      } else {
        navigate('/attendance', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = login(username, password);
    
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
    // If success, useEffect will handle redirect
  };

  const handleFaceLogin = (imageData) => {
    // Get stored face data from localStorage
    const storedFaces = JSON.parse(localStorage.getItem('faceData') || '{}');
    
    // For demo: Check if we have stored face for any user
    // In production, you would use face-api.js to compare faces
    const usernames = Object.keys(storedFaces);
    
    if (usernames.length === 0) {
      // First time - register face
      Swal.fire({
        title: 'Daftar Face ID',
        text: 'Pilih akun untuk didaftarkan dengan Face ID',
        input: 'select',
        inputOptions: {
          'ameliaagustina@bylia.com': 'Amelia Agustina',
          'devanoerhadinata@bylia.com': 'Devano Erhadinata'
        },
        inputPlaceholder: 'Pilih akun',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Daftar',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          // Store face data
          storedFaces[result.value] = imageData;
          localStorage.setItem('faceData', JSON.stringify(storedFaces));
          
          Swal.fire({
            title: 'Berhasil!',
            text: 'Face ID berhasil didaftarkan. Silakan login dengan Face ID.',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
        }
      });
      setShowFaceLogin(false);
    } else {
      // Login with face - for demo, just use the first registered user
      const registeredUsername = usernames[0];
      
      // Auto-fill and submit
      setUsername(registeredUsername);
      
      // Get password from demo accounts (in production, use proper face recognition)
      const passwords = {
        'ameliaagustina@bylia.com': 'amel123',
        'devanoerhadinata@bylia.com': 'deva123'
      };
      
      const result = login(registeredUsername, passwords[registeredUsername]);
      
      if (result.success) {
        Swal.fire({
          title: 'Selamat Datang!',
          text: `Login berhasil dengan Face ID`,
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'Gagal!',
          text: 'Face ID tidak dikenali',
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      }
      
      setShowFaceLogin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FontAwesomeIcon icon={faUser} className="text-4xl text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SewaApartemenByLia</h1>
          <p className="text-primary-100">Sistem Manajemen Apartemen</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FontAwesomeIcon 
                    icon={showPassword ? faEyeSlash : faEye} 
                    className="text-gray-400 hover:text-gray-600"
                  />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">atau</span>
            </div>
          </div>

          {/* Face ID Login Button */}
          <button
            onClick={() => setShowFaceLogin(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <FontAwesomeIcon icon={faCamera} className="text-xl" />
            Login dengan Face ID
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-100 text-sm mt-6">
          © 2026 SewaApartemenByLia. All rights reserved.
        </p>
      </div>

      {/* Face Login Modal */}
      {showFaceLogin && (
        <FaceLogin
          onFaceDetected={handleFaceLogin}
          onClose={() => setShowFaceLogin(false)}
        />
      )}
    </div>
  );
};

export default Login;
