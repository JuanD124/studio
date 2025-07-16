'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// CRÍTICO: Reemplaza este objeto con la configuración de tu propio proyecto de Firebase.
// 1. Ve a la consola de Firebase (https://console.firebase.google.com/).
// 2. Haz clic en el engranaje (⚙️) -> Configuración del proyecto.
// 3. En la sección "Tus apps", si no tienes una app web, crea una.
// 4. Firebase te dará un objeto `firebaseConfig`. Copia los valores y pégalos aquí.
const firebaseConfig = {
  // PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE
  apiKey: "AIzaSy_REEMPLAZAME_CON_TU_API_KEY",
  authDomain: "TU_ID_DE_PROYECTO.firebaseapp.com",
  projectId: "TU_ID_DE_PROYECTO",
  storageBucket: "TU_ID_DE_PROYECTO.appspot.com",
  messagingSenderId: "REEMPLAZAME_CON_TU_SENDER_ID",
  appId: "REEMPLAZAME_CON_TU_APP_ID"
};

// --- Verificación de la configuración de Firebase ---
// Esta variable nos dirá si la configuración parece ser la de ejemplo.
export const isFirebaseConfigInvalid = firebaseConfig.projectId === "TU_ID_DE_PROYECTO";

let db;

// Solo inicializamos Firebase si la configuración es válida.
if (!isFirebaseConfigInvalid) {
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (error) {
    console.error("Error al inicializar Firebase:", error);
    db = null;
  }
} else {
  // Si la configuración no es válida, `db` será `null`.
  // Los componentes mostrarán una advertencia.
  console.warn("La configuración de Firebase en src/lib/firebase.ts no es válida. Por favor, introduce tus credenciales.");
  db = null;
}


export { db };
