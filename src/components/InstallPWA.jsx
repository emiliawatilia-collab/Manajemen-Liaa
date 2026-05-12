import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if user already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ PWA installed');
    } else {
      console.log('❌ PWA installation declined');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-2xl p-4 border border-primary-500">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <Download size={24} className="text-primary-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm mb-1">
              Install Aplikasi
            </h3>
            <p className="text-primary-100 text-xs mb-3">
              Tambahkan ke home screen untuk akses lebih cepat seperti aplikasi native
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 py-2 bg-white text-primary-600 rounded-lg font-semibold text-sm hover:bg-primary-50 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 bg-primary-500/30 text-white rounded-lg hover:bg-primary-500/50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
