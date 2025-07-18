'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- Configuración de Firebase ---
// Credenciales para el proyecto LanzaExpress
const firebaseConfig = {
  apiKey: "AIzaSyCvKWgTa0b71w9lK8umg_IGMiIF7rR75S0",
  authDomain: "lavanderiafacil-f86a2.firebaseapp.com",
  projectId: "lavanderiafacil-f86a2",
  storageBucket: "lavanderiafacil-f86a2.appspot.com",
  messagingSenderId: "1079404806714",
  appId: "1:1079404806714:web:f778bdb6f76fb977c42b03",
  measurementId: "G-HE37H8GCM3"
};


// --- Verificación de la configuración de Firebase ---
// Comprueba si las credenciales están presentes.
export const isFirebaseConfigInvalid = !firebaseConfig.projectId;

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
  console.warn("La configuración de Firebase no es válida.");
}

export { db, auth };
