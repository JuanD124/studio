'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// CRÍTICO: Reemplaza este objeto con la configuración de tu propio proyecto de Firebase.
// 1. Ve a la consola de Firebase (https://console.firebase.google.com/).
// 2. Haz clic en el engranaje (⚙️) -> Configuración del proyecto.
// 3. En la sección "Tus apps", si no tienes una app web, crea una.
// 4. Firebase te dará un objeto `firebaseConfig`. Copia los valores y pégalos aquí.
//    El "projectId" que necesitas está en este objeto.
const firebaseConfig = {
  // Pega aquí tu configuración de Firebase
  apiKey: "AIzaSy_REEMPLAZAME_CON_TU_API_KEY",
  authDomain: "TU_ID_DE_PROYECTO.firebaseapp.com",
  projectId: "TU_ID_DE_PROYECTO",
  storageBucket: "TU_ID_DE_PROYECTO.appspot.com",
  messagingSenderId: "REEMPLAZAME_CON_TU_SENDER_ID",
  appId: "REEMPLAZAME_CON_TU_APP_ID"
};

// Inicializar Firebase
// Esto asegura que la app de Firebase se inicialice solo una vez.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
