import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const FaceLogin = ({ onFaceDetected, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      Swal.fire({
        title: 'Kamera Tidak Tersedia',
        text: 'Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan.',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    setCapturing(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          takePicture();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takePicture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Stop camera
      stopCamera();
      
      // Show success and return image
      Swal.fire({
        title: 'Foto Berhasil!',
        text: 'Wajah Anda berhasil dikenali',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        timer: 1500,
        showConfirmButton: false
      });
      
      setTimeout(() => {
        onFaceDetected(imageData);
      }, 1500);
    }
    
    setCapturing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Face ID Login</h3>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
          />
          
          {/* Face Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-80 border-4 border-primary-500 rounded-3xl opacity-50"></div>
          </div>

          {/* Countdown */}
          {countdown && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-8xl font-bold animate-pulse">
                {countdown}
              </div>
            </div>
          )}

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border-t border-blue-100">
          <p className="text-sm text-blue-800 text-center mb-3">
            📸 Posisikan wajah Anda di dalam frame
          </p>
          <button
            onClick={capturePhoto}
            disabled={capturing}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={capturing ? faCheckCircle : faCamera} />
            {capturing ? 'Mengambil Foto...' : 'Ambil Foto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaceLogin;
