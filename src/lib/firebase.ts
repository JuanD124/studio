'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Las credenciales de Firebase ahora se cargan desde variables de entorno.
// Esto es más seguro y es una práctica recomendada para producción.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// --- Verificación de la configuración de Firebase ---
// La variable ahora comprueba si las variables de entorno están presentes.
export const isFirebaseConfigInvalid = !firebaseConfig.projectId || !firebaseConfig.apiKey;

let app: FirebaseApp;
let db: any = null;
let auth: any = null;

// Solo inicializamos Firebase si la configuración es válida.
if (!isFirebaseConfigInvalid) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
    db = null;
    auth = null;
  }
} else {
  // Si la configuración no es válida, `db` será `null`.
  // Los componentes mostrarán una advertencia.
  console.warn("La configuración de Firebase no es válida. Asegúrate de que las variables de entorno están configuradas correctamente.");
}

export { db, auth };
