import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app = null;
let db = null;
let storage = null;
let isFirebaseSupported = false;

// Check if credentials are set and not mock placeholders
const isConfigured = 
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes('Mock') && 
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== 'lambroisie-restaurante';

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    isFirebaseSupported = true;
    console.log("🔥 Firebase Firestore y Storage inicializados correctamente.");
  } catch (error) {
    console.error("❌ Falló la inicialización de Firebase:", error);
  }
} else {
  console.warn("⚠️ Firebase no configurado o usa credenciales de prueba en .env. Se usará el modo LocalStorage.");
}

export { db, storage, isFirebaseSupported };
