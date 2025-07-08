'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// CRÍTICO: Reemplaza este objeto con la configuración de tu propio proyecto de Firebase.
// 1. Ve a la consola de Firebase (https://console.firebase.google.com/).
// 2. Crea un nuevo proyecto o selecciona uno existente.
// 3. Ve a la configuración de tu proyecto (el ícono del engranaje).
// 4. En la sección "Tus apps", añade una nueva aplicación web.
// 5. Firebase te proporcionará un objeto `firebaseConfig`. Cópialo y pégalo aquí.
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:XXXXXXXXXXXXXXXXXXXXXX"
};

// Inicializar Firebase
// Esto asegura que la app de Firebase se inicialice solo una vez.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
