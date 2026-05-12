import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'
import { unitsData } from './services/unitData'
import { migrateLocalStorageToFirebase } from './services/migrateData'

// Initialize localStorage with default data if empty
if (!localStorage.getItem('apartmentUnits')) {
  localStorage.setItem('apartmentUnits', JSON.stringify(unitsData));
}

// Migrate data from localStorage to Firebase (one-time)
const migrated = localStorage.getItem('firebaseMigrated');
if (!migrated) {
  migrateLocalStorageToFirebase().then((success) => {
    if (success) {
      localStorage.setItem('firebaseMigrated', 'true');
    }
  });
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
