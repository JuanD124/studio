'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// CRÍTICO: Reemplaza este objeto con la configuración de tu propio proyecto de Firebase.
// 1. Ve a la consola de Firebase (https://console.firebase.google.com/).
// 2. Haz clic en el engranaje (⚙️) -> Configuración del proyecto.
// 3. En la sección "Tus apps", si no tienes una app web, crea una.
// 4. Firebase te dará un objeto `firebaseConfig`. Copia los valores y pégalos aquí.
const firebaseConfig = {
  apiKey: "AIzaSyDEdS6Wl-tHMn29ekftc5jbL7Sa4TaXGIU",
  authDomain: "lavanderiafacil.firebaseapp.com",
  projectId: "lavanderiafacil",
  storageBucket: "lavanderiafacil.firebasestorage.app",
  messagingSenderId: "958579500745",
  appId: "1:958579500745:web:87ac53655cb9cbb8c54f18"
};

// --- Verificación de la configuración de Firebase ---
// Esta variable nos dirá si la configuración parece ser la de ejemplo.
export const isFirebaseConfigInvalid = firebaseConfig.projectId === "TU_ID_DE_PROYECTO" || !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("REEMPLAZAME");

let app: FirebaseApp;
let db;
let auth;

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
  console.warn("La configuración de Firebase en src/lib/firebase.ts no es válida. Por favor, introduce tus credenciales.");
  db = null;
  auth = null;
}

export { db, auth };
